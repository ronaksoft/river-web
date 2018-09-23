package main

import (
    "encoding/hex"
    "net/http"
    "sync"
    "time"

    "git.ronaksoftware.com/customers/river/messages"
    "github.com/dustin/go-humanize"
    "github.com/gorilla/websocket"
    "go.uber.org/zap"
)

// updateHandler
type UpdateHandler func(u *msg.UpdateContainer)

// OnConnectCallback
type OnConnectCallback func()

// NetworkStatusUpdateCallback
type NetworkStatusUpdateCallback func(newStatus NetworkStatus)

// networkConfig
type networkConfig struct {
    ServerEndpoint string
    // PingTime is the interval between each ping sent to server
    PingTime time.Duration
    // PongTimeout is the duration that will wait for the ping response (PONG) is received from
    // server. If we did not receive the pong message in PongTimeout then we assume connection
    // is not active, then we close it and try to re-connect.
    PongTimeout time.Duration
}

// networkController
type networkController struct {
    sync.Mutex

    // Internal Controller Channels
    connectChannel chan bool
    stopChannel    chan bool
    pongChannel    chan bool

    // Authorization Keys
    authID     int64
    authKey    []byte
    messageSeq int64

    // Websocket Settings
    wsDialer                *websocket.Dialer
    websocketEndpoint       string
    wsKeepConnection        bool
    wsPingTime              time.Duration
    wsPongTimeout           time.Duration
    wsConn                  *websocket.Conn
    wsOnMessage             MessageHandler
    wsOnUpdate              UpdateHandler
    wsOnConnect             func()
    wsOnNetworkStatusChange NetworkStatusUpdateCallback

    // Internals
    wsQuality  NetworkStatus
    pingDelays [3]time.Duration
    pingIdx    int
}

// newNetworkManager
func newNetworkController(config networkConfig) *networkController {
    m := new(networkController)
    if config.ServerEndpoint == "" {
        m.websocketEndpoint = PRODUCTION_SERVER_WEBSOCKET_ENDPOINT
    } else {
        m.websocketEndpoint = config.ServerEndpoint
    }
    if config.PingTime <= 0 {
        m.wsPingTime = DEFAULT_WS_PING_TIME
    } else {
        m.wsPingTime = config.PingTime
    }
    if config.PongTimeout <= 0 {
        m.wsPongTimeout = DEFAULT_WS_PONG_TIMEOUT
    } else {
        m.wsPongTimeout = config.PongTimeout
    }

    m.wsDialer = &websocket.Dialer{
        Proxy:            http.ProxyFromEnvironment,
        HandshakeTimeout: 10 * time.Second,
    }
    m.stopChannel = make(chan bool)
    m.connectChannel = make(chan bool)
    m.pongChannel = make(chan bool)
    return m
}

// Start
// Starts the controller background controller and watcher routines
func (ctrl *networkController) Start() error {
    if ctrl.wsOnUpdate == nil || ctrl.wsOnMessage == nil {
        return ErrHandlerNotSet
    }
    go ctrl.keepAlive()
    go ctrl.watchDog()
    return nil

}

// watchDog
// watchDog constantly listens to connectChannel and stopChannel to take the right
// actions in each case. If connect signal received the 'receiver' routine will be run
// to listen and accept web-socket packets. If stop signal received it means we are
// going to shutdown, hence returns from the function.
func (ctrl *networkController) watchDog() {
    for {
        select {
        case <-ctrl.connectChannel:
            _LOG.Debug("watchdog received connect signal")
            if ctrl.wsConn != nil {
                ctrl.receiver()
            }
            ctrl.updateNetworkStatus(DISCONNECTED)
            if ctrl.wsKeepConnection {
                go ctrl.Connect()
            }
        case <-ctrl.stopChannel:
            _LOG.Debug("watchDog received stop signal")
            return
        }

    }
}

// keepAlive
// This function by sending ping messages to server and measuring the server's response time
// calculates the quality of network
func (ctrl *networkController) keepAlive() {
    for {
        select {
        case <-time.After(ctrl.wsPingTime):
            if ctrl.wsConn == nil {
                continue
            }
            ctrl.Lock()
            ctrl.wsConn.SetWriteDeadline(time.Now().Add(DEFAULT_WS_WRITE_TIMEOUT))
            err := ctrl.wsConn.WriteMessage(websocket.PingMessage, nil)
            ctrl.Unlock()
            if err != nil {
                ctrl.wsConn.SetReadDeadline(time.Now())
                continue
            }
            pingTime := time.Now()
            select {
            case <-ctrl.pongChannel:
                pingDelay := time.Now().Sub(pingTime)
                _LOG.Debug("Ping/Pong",
                    zap.Duration("Duration", pingDelay),
                )
                ctrl.pingIdx++
                ctrl.pingDelays[ctrl.pingIdx%3] = pingDelay
                avgDelay := (ctrl.pingDelays[0] + ctrl.pingDelays[1] + ctrl.pingDelays[2]) / 3
                switch {
                case avgDelay > 1500*time.Millisecond:
                    ctrl.updateNetworkStatus(WEAK)
                case avgDelay > 500*time.Millisecond:
                    ctrl.updateNetworkStatus(SLOW)
                default:
                    ctrl.updateNetworkStatus(FAST)
                }
            case <-time.After(ctrl.wsPongTimeout):
                ctrl.wsConn.SetReadDeadline(time.Now())
            }
        case <-ctrl.stopChannel:
            _LOG.Debug("keepAlive received stop signal")
            return
        }
    }
}

// receiver
// This is the background routine listen for incoming websocket packets and _Decrypt
// the received message, if necessary, and  pass the extracted envelopes to messageHandler.
func (ctrl *networkController) receiver() {
    res := msg.ProtoMessage{}
    for {
        messageType, message, err := ctrl.wsConn.ReadMessage()
        if err != nil {
            _LOG.Debug(err.Error())
            return
        }
        switch messageType {
        case websocket.BinaryMessage:
            // If it is a BINARY message
            res.Unmarshal(message)
            if res.AuthID == 0 {
                receivedEnvelope := new(msg.MessageEnvelope)
                err = receivedEnvelope.Unmarshal(res.Payload)
                if err != nil {
                    _LOG.Warn(err.Error())
                    continue
                }
                ctrl.messageHandler(receivedEnvelope)
            } else {
                decryptedBytes, err := _Decrypt(ctrl.authKey, res.MessageKey, res.Payload)
                if err != nil {
                    _LOG.Warn(err.Error(),
                        zap.Int64(_LK_CLIENT_AUTH_ID, ctrl.authID),
                        zap.Int64(_LK_SERVER_AUTH_ID, res.AuthID),
                        zap.String(_LK_MSG_KEY, hex.Dump(res.MessageKey)),
                    )
                    continue
                }
                receivedEncryptedPayload := new(msg.ProtoEncryptedPayload)
                err = receivedEncryptedPayload.Unmarshal(decryptedBytes)
                if err != nil {
                    _LOG.Warn(err.Error())
                    continue
                }
                ctrl.messageHandler(receivedEncryptedPayload.Envelope)
            }
        }

    }
}

// updateNetworkStatus
// The average ping times will be calculated and this function will be called if
// quality of service changed.
func (ctrl *networkController) updateNetworkStatus(newStatus NetworkStatus) {
    if ctrl.wsQuality == newStatus {
        return
    }
    switch newStatus {
    case DISCONNECTED:
        _LOG.Info("networkController:: Disconnected")
    case WEAK:
        _LOG.Info("networkController:: Weak")
    case SLOW:
        _LOG.Info("networkController:: Slow")
    case FAST:
        _LOG.Info("networkController:: Fast")

    }

    ctrl.wsQuality = newStatus

    if ctrl.wsOnNetworkStatusChange != nil {
        ctrl.wsOnNetworkStatusChange(newStatus)
    }
}

// messageHandler
// MessageEnvelopes will be extracted and separates updates and messages. This function
// will call the wsOnUpdate or wsOnMessage accordingly.
func (ctrl *networkController) messageHandler(m *msg.MessageEnvelope) {
    switch m.Constructor {
    case msg.C_MessageContainer:
        x := new(msg.MessageContainer)
        x.Unmarshal(m.Message)
        _LOG.Debug("MessageContainer received",
            zap.Int32("LENGTH", x.Length),
        )
        for _, envelope := range x.Envelopes {
            ctrl.messageHandler(envelope)
        }
    case msg.C_UpdateContainer:
        x := new(msg.UpdateContainer)
        x.Unmarshal(m.Message)
        _LOG.Debug("UpdateContainer received",
            zap.Int32("LENGTH", x.Length),
            zap.Int64("MIN_UPDATE_ID", x.MinUpdateID),
            zap.Int64("MAX_UPDATE_ID", x.MaxUpdateID),
        )
        ctrl.wsOnUpdate(x)
    default:
        ctrl.wsOnMessage(m)
    }
}

// Stop
// Sends stop signal to keepAlive and watchDog routines.
func (ctrl *networkController) Stop() {
    // Send two signals to stop keepAlive and receiver routines
    ctrl.stopChannel <- true
    ctrl.stopChannel <- true
}

// Connect
func (ctrl *networkController) Connect() {
    _LOG.Info("networkController:: Connecting")
    ctrl.updateNetworkStatus(CONNECTING)
    keepGoing := true
    for keepGoing {
        if ctrl.wsConn != nil {
            ctrl.wsConn.Close()
        }
        if wsConn, _, err := ctrl.wsDialer.Dial(ctrl.websocketEndpoint, nil); err != nil {
            _LOG.Debug(err.Error())
            time.Sleep(3 * time.Second)
        } else {
            keepGoing = false
            ctrl.wsConn = wsConn
            ctrl.wsKeepConnection = true
            ctrl.wsConn.SetPongHandler(func(appData string) error {
                ctrl.pongChannel <- true
                return nil
            })
            ctrl.updateNetworkStatus(FAST)
        }
    }

    _LOG.Info("networkController:: Connected")

    // Call the OnConnect handler
    ctrl.wsOnConnect()

    // Send Signal to start the 'receiver' and 'keepAlive' routines
    ctrl.connectChannel <- true
}

// Disconnect
func (ctrl *networkController) Disconnect() {
    if ctrl.wsConn != nil {
        ctrl.wsKeepConnection = false
        ctrl.wsConn.Close()
    }
}

// setAuthorization
// If authID and authKey are defined then sending messages will be encrypted before
// writing on the wire.
func (ctrl *networkController) setAuthorization(authID int64, authKey []byte) {
    ctrl.authKey = make([]byte, len(authKey))
    ctrl.authID = authID
    copy(ctrl.authKey, authKey)
}

// SetMessageHandler
func (ctrl *networkController) SetMessageHandler(h MessageHandler) {
    ctrl.wsOnMessage = h
}

// SetUpdateHandler
func (ctrl *networkController) SetUpdateHandler(h UpdateHandler) {
    ctrl.wsOnUpdate = h
}

// SetOnConnectCallback
func (ctrl *networkController) SetOnConnectCallback(h OnConnectCallback) {
    ctrl.wsOnConnect = h
}

// SetNetworkStatusChangedCallback
func (ctrl *networkController) SetNetworkStatusChangedCallback(h NetworkStatusUpdateCallback) {
    ctrl.wsOnNetworkStatusChange = h
}

// sendWebsocket
// Writes the message on the wire. It will encrypts the message if authorization has been set.
func (ctrl *networkController) send(msgEnvelope *msg.MessageEnvelope) error {
    protoMessage := new(msg.ProtoMessage)
    protoMessage.AuthID = ctrl.authID
    protoMessage.MessageKey = make([]byte, 32)
    if ctrl.authID == 0 {
        protoMessage.Payload, _ = msgEnvelope.Marshal()
    } else {
        ctrl.messageSeq++
        encryptedPayload := msg.ProtoEncryptedPayload{
            ServerSalt: 234242, // TODO:: ServerSalt ?
            Envelope:   msgEnvelope,
        }
        encryptedPayload.MessageID = uint64(time.Now().Unix()<<32 | ctrl.messageSeq)
        unencryptedBytes, _ := encryptedPayload.Marshal()
        encryptedPayloadBytes, _ := _Encrypt(ctrl.authKey, unencryptedBytes)
        messageKey := _GenerateMessageKey(ctrl.authKey, unencryptedBytes)
        copy(protoMessage.MessageKey, messageKey)
        protoMessage.Payload = encryptedPayloadBytes
    }
    ctrl.Lock()
    defer ctrl.Unlock()

    b, err := protoMessage.Marshal()
    if err != nil {
        _LOG.Warn(err.Error())
    }
    if ctrl.wsConn == nil {
        _LOG.Warn(ErrNoConnection.Error())
        return ErrNoConnection
    }
    ctrl.wsConn.SetWriteDeadline(time.Now().Add(DEFAULT_WS_WRITE_TIMEOUT))
    if err := ctrl.wsConn.WriteMessage(websocket.BinaryMessage, b); err != nil {
        _LOG.Warn(err.Error())
        ctrl.updateNetworkStatus(DISCONNECTED)
        ctrl.wsConn.SetReadDeadline(time.Now())
        return err
    }
    _LOG.Debug("message sent to the wire",
        zap.String(_LK_FUNC_NAME, "networkController::send"),
        zap.String(_LK_MSG_SIZE, humanize.Bytes(uint64(protoMessage.Size()))),
    )
    return nil
}
