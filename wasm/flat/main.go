package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"git.ronaksoft.com/river/msg/msg"
	"github.com/mailru/easyjson"
	"github.com/mailru/easyjson/jlexer"
	"github.com/mailru/easyjson/jwriter"
	"github.com/monnand/dhkx"
	"math/big"
	mathRand "math/rand"
	"strconv"
	"syscall/js"
	"time"
)

// Global Parameters
const (
	PRODUCTION_SERVER_WEBSOCKET_ENDPOINT = "ws://river.im"
	DEFAULT_WS_PING_TIME                 = 30 * time.Second
	DEFAULT_WS_PONG_TIMEOUT              = 3 * time.Second
	DEFAULT_WS_WRITE_TIMEOUT             = 3 * time.Second
	DEFAULT_REQUEST_TIMEOUT              = 30 * time.Second
)

// LOG KEYS
const (
	_LK_FUNC_NAME        = "FUNC"
	_LK_CLIENT_AUTH_ID   = "C_AUTHID"
	_LK_SERVER_AUTH_ID   = "S_AUTHID"
	_LK_MSG_KEY          = "MSG_KEY"
	_LK_MSG_SIZE         = "MSG_SIZE"
	_LK_DESC             = "DESC"
	_LK_REQUEST_ID       = "REQUEST_ID"
	_LK_CONSTRUCTOR_NAME = "CONSTRUCTOR"
)

// Table Column Names
const (
	_CN_CONN_INFO = "CONN_INFO"
	_CN_UPDATE_ID = "UPDATE_ID"
)

type NetworkStatus int

const (
	DISCONNECTED NetworkStatus = iota
	CONNECTING
	WEAK
	SLOW
	FAST
)

type SyncStatus int

const (
	OutOfSync SyncStatus = iota
	Syncing
	Synced
)

var (
	ErrHandlerNotSet       = errors.New("handlers are not set")
	ErrRequestTimeout      = errors.New("request timeout")
	ErrInvalidConstructor  = errors.New("constructor did not expected")
	ErrSecretNonceMismatch = errors.New("secret hash does not match")
	ErrAuthFailed          = errors.New("creating auth key failed")
	ErrNoConnection        = errors.New("no connection")
	ErrNotFound            = errors.New("not found")
	ErrDoesNotExists       = errors.New("does not exists")
	ErrQueuePathIsNotSet   = errors.New("queue path is not set")
)

// ServerError
func ServerError(b []byte) error {
	x := new(msg.Error)
	x.Unmarshal(b)
	return errors.New(fmt.Sprintf("%s:%s", x.Code, x.Items))
}

var (
	_ServerKeys serverKeys
)

type MessageHandler func(m *msg.MessageEnvelope)
type TimeoutCallback func()
type Callback func(time int64)

//type MessageQ map[uint64]*MessageHandler
var authTryCount = 0

type River struct {
	// Connection Info
	ConnInfo     *RiverConnection
	MessageQueue map[uint64]*MessageHandler
	LastMsg      *msg.MessageEnvelope

	// Authorization Keys
	authID     int64
	authKey    []byte
	messageSeq int64
}

func AuthProgress(progress int) {
	js.Global().Call("authProgress", progress)
}

func (r *River) Start(connInfo string, callback *Callback) {
	r.ConnInfo = NewRiverConnection(connInfo)
	r.MessageQueue = make(map[uint64]*MessageHandler)

	AuthProgress(0)
	// Initialize Server Keys
	if err := _ServerKeys.UnmarshalJSON([]byte(`{"PublicKeys":[{"N":"25118848897932282177245700919139384404750150099443051286420483958680932318999616785468117358656906868745535067114368253583642867447644069742034871690887327807641806393154362866814670869067082838910855582042571344627633847312858985989376011283293406446259224113424892885526467096873630090982411366060309228545939134187830467758087915442541333526473506224183662758369346162982899850891065845576237266688752908504452157782224543297742005937283247646798191769066825742717116948044645985042083938549757785369721749659525202291409273477753359658898944013607000873216784148319330165950486883420334054833644032847855482032509","FingerPrint":7394918641852592645,"E":65537},{"N":"21249707023259589828882625203572225674272580290693121144039064585772886999841963721536409526022282440843688128262657540061767032187088787519653928724034793475849047994789250487935742236267848935158291781289935130264092548463720489626032599455872076196089874292697176233901232972584747422218633150431148606115133786415925258966498648297190127103542990365765167875712382655400672904401808039905581013143219877381673335013417196709050371628383130063205039714231505438906188340348457944648916217683298881611185125570182541993037806056563338841286324689864878852103314733737724967696722326127563991449350826172408373703811","FingerPrint":2363776248257911173,"E":65537},{"N":"19863054550604193823488041727574907794553354963467193076917818924664132721754826665850220231906962083775008201369133561957397980133889912558248851951970519776044765817502621009587064784777693096628382835779877029866758294196797090656332977683146622524047322377443516436601239695252843413905686699399020467544689455363457822624449365145949732364643029028423685551893583641819962002723393831006146669077949073237542941080523176298527840258778842205532339989739100238320204236098210328490552190436163372996242056017356783361778247846127669138796572298996264305675423638602261670710374605191817283295227384113688431647741","FingerPrint":-5099141843327820626,"E":65537},{"N":"29760428901343664001028833309809794343544015677516397170674878601215588275791808212890742556162155895595827561470784507818927441382831252170628521332528557087987520295267196790927612592611029658149082172703008759671157419031039827342837361544291472718895472521013019716259483209354020921442127452371575891423820946699295605756004551833001279075974074080563224444666224932026454045362404382286378528513546737731664019469325785485757138817241905803574388304564238374420073230240484847573015947946433863321363117973803262320677243592635383550602155520291663476434998507275737426553598472331105536846460631682739989661219","FingerPrint":2195174703119182464,"E":65537},{"N":"18386064557489952286420347590296751434578282707405869816885958713299461000323959947566645042552856526031409640177153580413557456444169596581870998341797298680104080669684015732452983077686038078494582573312218274626467111808818429778886097765709133950743171507322894959330274463277504523606073120382446662040167960142274463155227517163276212205755835422067514615854827329645266346012533996475215453580382748104598835874268054865686479895544554797198146708876762174829892817477539609356506735917106650744544665071969880523400678780093929701726905569602897801522055926413967804403930759100613510462652269603976775523991","FingerPrint":4479840379683382772,"E":65537},{"N":"26856167804545448049290579564011023468588993763008293592188466181493624152203964999095367371420795128612430412472216110838073483063451607435345678606377899388181953712712568128395316210032734586003021350117744410467197964162932002685114458972873577239300798020981277258362899408637644884906090479440297628771615765991411446325782942661223836610577955450204097820932873841360326076035286707297809053813347011465715499268402698830927150083994456520884686861897089801285632944182913126283200633552976218386749841394603856739318115312415688232906365260846416122082293147230082963151578228644118548380817922335519702098503","FingerPrint":8569728225196202638,"E":65537},{"N":"25761140930539439978494783846660734379198950078321693758033663237052334640619530471139381746103855925800702484276297098648531198741474154475735948656994497481651905678934562912991440112672560383261093402078501161430697511324735371368031617819168590943786234823019615023005756998056375397284879696822974650961011580206091499395498399390492214337547240343451565823803753121080531070054153784629505452057439601601659807136850041526794231441222954424268629610149685990628010782230767695141965499949849652822543965784952473307155505095483489743547945382166911358040409429285318638614625039958145755691598575103601662635873","FingerPrint":-3518366518126294391,"E":65537},{"N":"21878729227264443273397917465852122220894317740032779776997968051790123215989999965841007199864479838712294015929085122553441217024812487754107081810828692874014089314153826066240729740923792526876590678500745479627405100598576824756706391682294987326965673261452172826182988573765370466024746236316548372296498943339682423467178382713458130758590318962795115037395346029561258543522802194745122834923204527595669724518557927046350328890508977160087250218063301295330767720877139867168393712617902052319906711468238632536228153728846644967777470083076472892276635992022186751494397742523839928248454129614564991083729","FingerPrint":2842355922125748985,"E":65537},{"N":"21657921575259117082437287735038824160972581974539609548491823065113660182941223450746616405735767608349485813933217527787805175774080112057626391016872155067405926907423276805486934732269185402251726464897721288759735238594916980944505711016119900765546002533418456991149932694983775618316688113269913087592812309102853747522924306054009231759094013878121201675566877636823973567095580198874586722886709122615656758634448002677386356379713382005231679191964292977504291853536019601586206944266621069762821758456214432463931452218289861680478993171959176435089862340125449068198909635604459895897355597575325195619933","FingerPrint":-3702519902476465341,"E":65537},{"N":"26560773297321496796638749735111859220513359531489936481661136779884784205625113812180402394116732738755028273755313585352103067809685809119858624584482833675871489309402205980675382020337358851404166618802304410342906475560595604118840081050808937188565007332779418031411195462315469094720417421137008865029869517973582341668257878628972653824064257107524501253937531889165608386214524613639093523758099418212998287757704077924182163275085135477703526566976609275979665583622386423029286172254415496073164236409043934726212766525195423766504808027467773836621258239588220853730478580185244315599773665364850566951753","FingerPrint":-2599890069662518803,"E":65537}],"DHGroups":[{"Prime":"FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AACAA68FFFFFFFFFFFFFFFF","Gen":2,"FingerPrint":-4978776997167059722}]}`)); err != nil {
		fmt.Println(err.Error())
	}

	AuthProgress(1)

	if r.ConnInfo.AuthID == 0 {
		authErr := river.CreateAuthKey(func(time int64) {
			fmt.Println("Auth initialized")
			r.authID = r.ConnInfo.AuthID
			r.authKey = r.ConnInfo.AuthKey[:]
			cb := *callback
			cb(time)
		})
		if authErr != nil {
			authTryCount++
			if authTryCount < 10 {
				r.Start(connInfo, callback)
				return
			}
		}
		AuthProgress(10)
	} else {
		r.authID = r.ConnInfo.AuthID
		r.authKey = r.ConnInfo.AuthKey[:]
		AuthProgress(100)
		cb := *callback
		cb(-1)
	}
}

func (r *River) CreateAuthKey(callback Callback) (err error) {
	var clientNonce, serverNonce, serverPubFP, serverDHFP, serverPQ uint64
	// 1. Send InitConnect to Server
	req1 := new(msg.InitConnect)
	req1.ClientNonce = _RandomUint64()
	req1Bytes, _ := req1.Marshal()

	fmt.Println("1st Step Started :: InitConnect")
	r.ExecuteRemoteCommand(
		_RandomUint64(),
		msg.C_InitConnect,
		&req1Bytes,
		func(res *msg.MessageEnvelope) {
			fmt.Println("Success Callback Called")
			AuthProgress(12)
			switch res.Constructor {
			case msg.C_InitResponse:
				x := new(msg.InitResponse)
				err = x.Unmarshal(res.Message)
				if err != nil {
					fmt.Println(err.Error(), "InitResponse Unmarshal")
				}
				AuthProgress(15)
				clientNonce = x.ClientNonce
				serverNonce = x.ServerNonce
				serverPubFP = x.RSAPubKeyFingerPrint
				serverDHFP = x.DHGroupFingerPrint
				serverPQ = x.PQ
				//fmt.Println("InitResponse :: Received",
				//	"ServerNonce", serverNonce,
				//	"ClientNounce", clientNonce,
				//	"ServerDhFingerPrint", serverDHFP,
				//	"ServerFingerPrint", serverPubFP,
				//)
			case msg.C_Error:
				err = ServerError(res.Message)
			default:
				err = ErrInvalidConstructor
			}
			if err != nil {
				fmt.Println(err.Error())
				return
			} else {
				r.createAuthKeyStep2(clientNonce, serverNonce, serverPubFP, serverDHFP, serverPQ, &callback)
				fmt.Println("1st Step Finished")
			}
		},
	)

	return
}

func (r *River) createAuthKeyStep2(clientNonce, serverNonce, serverPubFP, serverDHFP, serverPQ uint64, callback *Callback) (err error) {
	AuthProgress(17)
	var duration int64 = 0
	t := r.ConnInfo.Now()
	// 2. Send InitCompleteAuth
	req2 := new(msg.InitCompleteAuth)
	req2.ServerNonce = serverNonce
	req2.ClientNonce = clientNonce

	// Generate DH Pub Key
	dhGroup, err := _ServerKeys.getDhGroup(int64(serverDHFP))
	if err != nil {
		return err
	}
	dhPrime := big.NewInt(0)
	dhPrime.SetString(dhGroup.Prime, 16)
	AuthProgress(30)

	dh := dhkx.CreateGroup(dhPrime, big.NewInt(int64(dhGroup.Gen)))
	AuthProgress(35)
	clientDhKey, _ := dh.GeneratePrivateKey(rand.Reader)
	AuthProgress(40)
	req2.ClientDHPubKey = clientDhKey.Bytes()
	AuthProgress(45)

	p, q := _SplitPQ(big.NewInt(int64(serverPQ)))
	if p.Cmp(q) < 0 {
		req2.P = p.Uint64()
		req2.Q = q.Uint64()
	} else {
		req2.P = q.Uint64()
		req2.Q = p.Uint64()
	}
	AuthProgress(55)

	q2Internal := new(msg.InitCompleteAuthInternal)
	q2Internal.SecretNonce = []byte(_RandomID(16))
	AuthProgress(60)

	serverPubKey, err := _ServerKeys.getPublicKey(int64(serverPubFP))
	if err != nil {
		return err
	}
	n := big.NewInt(0)
	n.SetString(serverPubKey.N, 10)
	rsaPublicKey := rsa.PublicKey{
		N: n,
		E: int(serverPubKey.E),
	}

	AuthProgress(65)
	decrypted, _ := q2Internal.Marshal()
	encrypted, err := rsa.EncryptPKCS1v15(rand.Reader, &rsaPublicKey, decrypted)
	if err != nil {
		fmt.Println(err.Error())
	}

	AuthProgress(70)
	req2.EncryptedPayload = encrypted
	req2Bytes, _ := req2.Marshal()
	duration = r.ConnInfo.Now() - t

	AuthProgress(75)
	r.ExecuteRemoteCommand(
		_RandomUint64(),
		msg.C_InitCompleteAuth,
		&req2Bytes,
		func(res *msg.MessageEnvelope) {
			switch res.Constructor {
			case msg.C_InitAuthCompleted:
				x := new(msg.InitAuthCompleted)
				x.Unmarshal(res.Message)
				switch x.Status {
				case msg.InitAuthCompleted_OK:
					serverDhKey, err := dh.ComputeKey(dhkx.NewPublicKey(x.ServerDHPubKey), clientDhKey)
					if err != nil {
						fmt.Println(err.Error())
						return
					}

					copy(r.ConnInfo.AuthKey[:], serverDhKey.Bytes())
					authKeyHash, _ := _Sha256(r.ConnInfo.AuthKey[:])
					r.ConnInfo.AuthID = int64(binary.LittleEndian.Uint64(authKeyHash[24:32]))
					AuthProgress(80)

					var secret []byte
					secret = append(secret, q2Internal.SecretNonce...)
					secret = append(secret, byte(msg.InitAuthCompleted_OK))
					secret = append(secret, authKeyHash[:8]...)
					secretHash, _ := _Sha256(secret)

					if x.SecretHash != binary.LittleEndian.Uint64(secretHash[24:32]) {
						fmt.Println(x.SecretHash, binary.LittleEndian.Uint64(secretHash[24:32]))
						err = ErrSecretNonceMismatch
						return
					}
					AuthProgress(90)
				case msg.InitAuthCompleted_RETRY:
					// TODO:: Retry with new DHKey
				case msg.InitAuthCompleted_FAIL:
					err = ErrAuthFailed
					return
				}
				r.ConnInfo.Save()
				r.authKey = r.ConnInfo.AuthKey[:]
				r.authID = r.ConnInfo.AuthID
				cb := *callback
				cb(duration)
				AuthProgress(100)
			case msg.C_Error:
				err = ServerError(res.Message)
				return
			default:
				err = ErrInvalidConstructor
				return
			}
		},
	)
	return
}

func (r *River) ExecuteRemoteCommand(requestID uint64, constructor int64, commandBytes *[]byte, successCB MessageHandler) {
	//r.queueCtrl.executeCommand(requestID, constructor, commandBytes, timeoutCB, successCB)
	_msg := new(msg.MessageEnvelope)
	_msg.RequestID = requestID
	_msg.Constructor = constructor
	_msg.Message = *commandBytes

	if successCB != nil {
		r.MessageQueue[requestID] = &successCB
	}
	r.send(_msg, true)
}

func (r *River) ExecuteEncrypt(requestID uint64, constructor int64, commandBytes *[]byte) {
	_msg := new(msg.MessageEnvelope)
	_msg.RequestID = requestID
	_msg.Constructor = constructor
	_msg.Message = *commandBytes

	r.send(_msg, false)
}

func (r *River) send(msgEnvelope *msg.MessageEnvelope, webSocket bool) {
	protoMessage := new(msg.ProtoMessage)
	protoMessage.AuthID = r.authID
	protoMessage.MessageKey = make([]byte, 32)
	if r.authID == 0 || msgEnvelope.Constructor == msg.C_SystemGetServerTime || msgEnvelope.Constructor == msg.C_SystemGetInfo || msgEnvelope.Constructor == msg.C_SystemGetSalts {
		protoMessage.AuthID = 0
		protoMessage.Payload, _ = msgEnvelope.Marshal()
	} else {
		r.messageSeq++
		encryptedPayload := msg.ProtoEncryptedPayload{
			ServerSalt: 234242, // TODO:: ServerSalt ?
			Envelope:   msgEnvelope,
		}
		encryptedPayload.MessageID = uint64(r.ConnInfo.Now()<<32 | r.messageSeq)
		unencryptedBytes, _ := encryptedPayload.Marshal()
		encryptedPayloadBytes, _ := _Encrypt(r.authKey, unencryptedBytes)
		messageKey := _GenerateMessageKey(r.authKey, unencryptedBytes)
		copy(protoMessage.MessageKey, messageKey)
		protoMessage.Payload = encryptedPayloadBytes
	}

	b, err := protoMessage.Marshal()
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	if webSocket {
		if msgEnvelope.Constructor == msg.C_InitConnect || msgEnvelope.Constructor == msg.C_InitCompleteAuth || msgEnvelope.Constructor == msg.C_SystemGetServerTime {
			r.LastMsg = msgEnvelope
		} else {
			r.LastMsg = nil
		}
		js.Global().Call("wsSend", base64.StdEncoding.EncodeToString(b))
	} else {
		js.Global().Call("fnEncryptCallback", msgEnvelope.RequestID, base64.StdEncoding.EncodeToString(b))
	}
}

func (r *River) receive(message *[]byte, webSocket bool) {
	res := msg.ProtoMessage{}

	// If it is a BINARY message

	res.Unmarshal(*message)

	if res.AuthID == 0 {
		receivedEnvelope := new(msg.MessageEnvelope)
		err := receivedEnvelope.Unmarshal(res.Payload)
		if err != nil {
			fmt.Println(err.Error())
			return
		}
		if webSocket {
			r.messageHandler(receivedEnvelope)
		} else {
			r.decryptHandler(receivedEnvelope)
		}
	} else {
		decryptedBytes, err := _Decrypt(r.authKey, res.MessageKey, res.Payload)
		if err != nil {
			//fmt.Println(err.Error(),
			//	_LK_CLIENT_AUTH_ID, r.authID,
			//	_LK_SERVER_AUTH_ID, res.AuthID,
			//	_LK_MSG_KEY, hex.Dump(res.MessageKey),
			//)
			js.Global().Call("fnDecryptError")
			return
		}
		receivedEncryptedPayload := new(msg.ProtoEncryptedPayload)
		err = receivedEncryptedPayload.Unmarshal(decryptedBytes)
		if err != nil {
			fmt.Println(err.Error())
			return
		}
		if webSocket {
			r.messageHandler(receivedEncryptedPayload.Envelope)
		} else {
			r.decryptHandler(receivedEncryptedPayload.Envelope)
		}
	}
}

func (r *River) messageHandler(m *msg.MessageEnvelope) {
	switch m.Constructor {
	case msg.C_MessageContainer:
		x := new(msg.MessageContainer)
		ee := x.Unmarshal(m.Message)
		if ee != nil {
			fmt.Println("Error", ee.Error())
		}
		for _, envelope := range x.Envelopes {
			r.messageHandler(envelope)
		}
	case msg.C_UpdateContainer:
		x := new(msg.UpdateContainer)
		x.Unmarshal(m.Message)
		js.Global().Call("fnUpdate", base64.StdEncoding.EncodeToString(m.Message))
	default:
		if val, ok := r.MessageQueue[m.RequestID]; ok && (*val) != nil {
			(*val)(m)
			delete(r.MessageQueue, m.RequestID)
		} else if m.Constructor == msg.C_Error {
			error := new(msg.Error)
			error.Unmarshal(m.Message)
			if error.Code == "E01" && error.Items == "AUTH" {
				js.Global().Call("wsError", m.RequestID, m.Constructor, base64.StdEncoding.EncodeToString(m.Message))
			} else {
				js.Global().Call("fnCallback", m.RequestID, m.Constructor, base64.StdEncoding.EncodeToString(m.Message))
			}
		} else {
			js.Global().Call("fnCallback", m.RequestID, m.Constructor, base64.StdEncoding.EncodeToString(m.Message))
		}
	}
}

func (r *River) decryptHandler(m *msg.MessageEnvelope) {
	switch m.Constructor {
	case msg.C_MessageContainer:
		x := new(msg.MessageContainer)
		ee := x.Unmarshal(m.Message)
		if ee != nil {
			fmt.Println("Error", ee.Error())
		}
		for _, envelope := range x.Envelopes {
			r.decryptHandler(envelope)
		}
	case msg.C_UpdateContainer:
		x := new(msg.UpdateContainer)
		x.Unmarshal(m.Message)
		js.Global().Call("fnDecryptCallback", m.RequestID, m.Constructor, base64.StdEncoding.EncodeToString(m.Message))
	default:
		js.Global().Call("fnDecryptCallback", m.RequestID, m.Constructor, base64.StdEncoding.EncodeToString(m.Message))
	}
}

func (r *River) RetryLast() {
	if r.LastMsg != nil {
		r.send(r.LastMsg, true)
	}
}

func (r *River) SetServerTime(callback Callback) (err error) {
	req := new(msg.SystemGetServerTime)
	reqBytes, _ := req.Marshal()

	r.ExecuteRemoteCommand(
		_RandomUint64(),
		msg.C_SystemGetServerTime,
		&reqBytes,
		func(res *msg.MessageEnvelope) {
			var time int64 = 0
			switch res.Constructor {
			case msg.C_SystemServerTime:
				x := new(msg.SystemServerTime)
				err = x.Unmarshal(res.Message)
				if err != nil {
					fmt.Println(err.Error(), "InitResponse Unmarshal")
				} else {
					time = x.Timestamp
				}
				callback(time)
			default:
				err = ErrInvalidConstructor
				callback(0)
			}
		},
	)

	return
}

// easyjson:json
// publicKey
type publicKey struct {
	N           string
	FingerPrint int64
	E           uint32
}

// easyjson:json
// dHGroup
type dHGroup struct {
	Prime       string
	Gen         int32
	FingerPrint int64
}

// easyjson:json
// serverKeys
type serverKeys struct {
	PublicKeys []publicKey
	DHGroups   []dHGroup
}

// getPublicKey
func (v *serverKeys) getPublicKey(keyFP int64) (publicKey, error) {
	for _, pk := range v.PublicKeys {
		if pk.FingerPrint == keyFP {
			return pk, nil
		}
	}
	return publicKey{}, ErrNotFound
}

// getDhGroup
func (v *serverKeys) getDhGroup(keyFP int64) (dHGroup, error) {
	for _, dh := range v.DHGroups {
		if dh.FingerPrint == keyFP {
			return dh, nil
		}
	}
	return dHGroup{}, ErrNotFound
}

// easyjson:json
// RiverConnection
type RiverConnection struct {
	AuthID    int64
	AuthKey   [256]byte
	UserID    int64
	Username  string
	Phone     string
	FirstName string
	LastName  string
	DiffTime  int64
}

// easyjson:json
// RiverConnection
type RiverConnectionJS struct {
	AuthID    string
	AuthKey   [256]byte
	UserID    string
	Username  string
	Phone     string
	FirstName string
	LastName  string
}

// NewRiverConnection
func NewRiverConnection(connInfo string) *RiverConnection {
	rc := new(RiverConnection)
	if err := rc.Load(connInfo); err != nil {
		rc.Save()
	}
	rc.DiffTime = 0
	return rc
}

// Save
func (v *RiverConnection) Save() {
	var vv = RiverConnectionJS{
		AuthKey:   v.AuthKey,
		AuthID:    strconv.FormatInt(v.AuthID, 10),
		Username:  v.Username,
		FirstName: v.FirstName,
		LastName:  v.LastName,
		Phone:     v.Phone,
		UserID:    strconv.FormatInt(v.UserID, 10),
	}
	if bytes, err := json.Marshal(vv); err != nil {
		fmt.Println(err.Error(), "RiverConnection::Save")
	} else {
		js.Global().Call("saveConnInfo", string(bytes))
	}
}

// Load
func (v *RiverConnection) Load(connInfo string) error {
	var vv = RiverConnectionJS{}
	if err := json.Unmarshal([]byte(connInfo), &vv); err != nil {
		fmt.Println(err.Error(), "RiverConnection::Load")
		return err
	}
	v.AuthKey = vv.AuthKey
	v.AuthID, _ = strconv.ParseInt(vv.AuthID, 10, 64)
	v.FirstName = vv.FirstName
	v.LastName = vv.LastName
	v.Phone = vv.Phone
	v.Username = vv.Username
	v.UserID, _ = strconv.ParseInt(vv.UserID, 10, 64)
	return nil
}

func (v *RiverConnection) SetServerTime(timestamp int64) {
	v.DiffTime = timestamp - time.Now().Unix()
}

func (v *RiverConnection) Now() int64 {
	return time.Now().Unix() + v.DiffTime
}

// suppress unused package warning
var (
	_ *json.RawMessage
	_ *jlexer.Lexer
	_ *jwriter.Writer
	_ easyjson.Marshaler
)

func easyjson94b2531bDecodeGitRonaksoftwareComRonakSdkRiver(in *jlexer.Lexer, out *serverKeys) {
	isTopLevel := in.IsStart()
	if in.IsNull() {
		if isTopLevel {
			in.Consumed()
		}
		in.Skip()
		return
	}
	in.Delim('{')
	for !in.IsDelim('}') {
		key := in.UnsafeString()
		in.WantColon()
		if in.IsNull() {
			in.Skip()
			in.WantComma()
			continue
		}
		switch key {
		case "PublicKeys":
			if in.IsNull() {
				in.Skip()
				out.PublicKeys = nil
			} else {
				in.Delim('[')
				if out.PublicKeys == nil {
					if !in.IsDelim(']') {
						out.PublicKeys = make([]publicKey, 0, 2)
					} else {
						out.PublicKeys = []publicKey{}
					}
				} else {
					out.PublicKeys = (out.PublicKeys)[:0]
				}
				for !in.IsDelim(']') {
					var v1 publicKey
					if data := in.Raw(); in.Ok() {
						in.AddError((v1).UnmarshalJSON(data))
					}
					out.PublicKeys = append(out.PublicKeys, v1)
					in.WantComma()
				}
				in.Delim(']')
			}
		case "DHGroups":
			if in.IsNull() {
				in.Skip()
				out.DHGroups = nil
			} else {
				in.Delim('[')
				if out.DHGroups == nil {
					if !in.IsDelim(']') {
						out.DHGroups = make([]dHGroup, 0, 2)
					} else {
						out.DHGroups = []dHGroup{}
					}
				} else {
					out.DHGroups = (out.DHGroups)[:0]
				}
				for !in.IsDelim(']') {
					var v2 dHGroup
					if data := in.Raw(); in.Ok() {
						in.AddError((v2).UnmarshalJSON(data))
					}
					out.DHGroups = append(out.DHGroups, v2)
					in.WantComma()
				}
				in.Delim(']')
			}
		default:
			in.SkipRecursive()
		}
		in.WantComma()
	}
	in.Delim('}')
	if isTopLevel {
		in.Consumed()
	}
}
func easyjson94b2531bEncodeGitRonaksoftwareComRonakSdkRiver(out *jwriter.Writer, in serverKeys) {
	out.RawByte('{')
	first := true
	_ = first
	{
		const prefix string = ",\"PublicKeys\":"
		if first {
			first = false
			out.RawString(prefix[1:])
		} else {
			out.RawString(prefix)
		}
		if in.PublicKeys == nil && (out.Flags&jwriter.NilSliceAsEmpty) == 0 {
			out.RawString("null")
		} else {
			out.RawByte('[')
			for v3, v4 := range in.PublicKeys {
				if v3 > 0 {
					out.RawByte(',')
				}
				out.Raw((v4).MarshalJSON())
			}
			out.RawByte(']')
		}
	}
	{
		const prefix string = ",\"DHGroups\":"
		if first {
			first = false
			out.RawString(prefix[1:])
		} else {
			out.RawString(prefix)
		}
		if in.DHGroups == nil && (out.Flags&jwriter.NilSliceAsEmpty) == 0 {
			out.RawString("null")
		} else {
			out.RawByte('[')
			for v5, v6 := range in.DHGroups {
				if v5 > 0 {
					out.RawByte(',')
				}
				out.Raw((v6).MarshalJSON())
			}
			out.RawByte(']')
		}
	}
	out.RawByte('}')
}

// MarshalJSON supports json.Marshaler interface
func (v serverKeys) MarshalJSON() ([]byte, error) {
	w := jwriter.Writer{}
	easyjson94b2531bEncodeGitRonaksoftwareComRonakSdkRiver(&w, v)
	return w.Buffer.BuildBytes(), w.Error
}

// MarshalEasyJSON supports easyjson.Marshaler interface
func (v serverKeys) MarshalEasyJSON(w *jwriter.Writer) {
	easyjson94b2531bEncodeGitRonaksoftwareComRonakSdkRiver(w, v)
}

// UnmarshalJSON supports json.Unmarshaler interface
func (v *serverKeys) UnmarshalJSON(data []byte) error {
	r := jlexer.Lexer{Data: data}
	easyjson94b2531bDecodeGitRonaksoftwareComRonakSdkRiver(&r, v)
	return r.Error()
}

// UnmarshalEasyJSON supports easyjson.Unmarshaler interface
func (v *serverKeys) UnmarshalEasyJSON(l *jlexer.Lexer) {
	easyjson94b2531bDecodeGitRonaksoftwareComRonakSdkRiver(l, v)
}
func easyjson94b2531bDecodeGitRonaksoftwareComRonakSdkRiver1(in *jlexer.Lexer, out *publicKey) {
	isTopLevel := in.IsStart()
	if in.IsNull() {
		if isTopLevel {
			in.Consumed()
		}
		in.Skip()
		return
	}
	in.Delim('{')
	for !in.IsDelim('}') {
		key := in.UnsafeString()
		in.WantColon()
		if in.IsNull() {
			in.Skip()
			in.WantComma()
			continue
		}
		switch key {
		case "N":
			out.N = string(in.String())
		case "FingerPrint":
			out.FingerPrint = int64(in.Int64())
		case "E":
			out.E = uint32(in.Uint32())
		default:
			in.SkipRecursive()
		}
		in.WantComma()
	}
	in.Delim('}')
	if isTopLevel {
		in.Consumed()
	}
}
func easyjson94b2531bEncodeGitRonaksoftwareComRonakSdkRiver1(out *jwriter.Writer, in publicKey) {
	out.RawByte('{')
	first := true
	_ = first
	{
		const prefix string = ",\"N\":"
		if first {
			first = false
			out.RawString(prefix[1:])
		} else {
			out.RawString(prefix)
		}
		out.String(string(in.N))
	}
	{
		const prefix string = ",\"FingerPrint\":"
		if first {
			first = false
			out.RawString(prefix[1:])
		} else {
			out.RawString(prefix)
		}
		out.Int64(int64(in.FingerPrint))
	}
	{
		const prefix string = ",\"E\":"
		if first {
			first = false
			out.RawString(prefix[1:])
		} else {
			out.RawString(prefix)
		}
		out.Uint32(uint32(in.E))
	}
	out.RawByte('}')
}

// MarshalJSON supports json.Marshaler interface
func (v publicKey) MarshalJSON() ([]byte, error) {
	w := jwriter.Writer{}
	easyjson94b2531bEncodeGitRonaksoftwareComRonakSdkRiver1(&w, v)
	return w.Buffer.BuildBytes(), w.Error
}

// MarshalEasyJSON supports easyjson.Marshaler interface
func (v publicKey) MarshalEasyJSON(w *jwriter.Writer) {
	easyjson94b2531bEncodeGitRonaksoftwareComRonakSdkRiver1(w, v)
}

// UnmarshalJSON supports json.Unmarshaler interface
func (v *publicKey) UnmarshalJSON(data []byte) error {
	r := jlexer.Lexer{Data: data}
	easyjson94b2531bDecodeGitRonaksoftwareComRonakSdkRiver1(&r, v)
	return r.Error()
}

// UnmarshalEasyJSON supports easyjson.Unmarshaler interface
func (v *publicKey) UnmarshalEasyJSON(l *jlexer.Lexer) {
	easyjson94b2531bDecodeGitRonaksoftwareComRonakSdkRiver1(l, v)
}
func easyjson94b2531bDecodeGitRonaksoftwareComRonakSdkRiver2(in *jlexer.Lexer, out *dHGroup) {
	isTopLevel := in.IsStart()
	if in.IsNull() {
		if isTopLevel {
			in.Consumed()
		}
		in.Skip()
		return
	}
	in.Delim('{')
	for !in.IsDelim('}') {
		key := in.UnsafeString()
		in.WantColon()
		if in.IsNull() {
			in.Skip()
			in.WantComma()
			continue
		}
		switch key {
		case "Prime":
			out.Prime = string(in.String())
		case "Gen":
			out.Gen = int32(in.Int32())
		case "FingerPrint":
			out.FingerPrint = int64(in.Int64())
		default:
			in.SkipRecursive()
		}
		in.WantComma()
	}
	in.Delim('}')
	if isTopLevel {
		in.Consumed()
	}
}
func easyjson94b2531bEncodeGitRonaksoftwareComRonakSdkRiver2(out *jwriter.Writer, in dHGroup) {
	out.RawByte('{')
	first := true
	_ = first
	{
		const prefix string = ",\"Prime\":"
		if first {
			first = false
			out.RawString(prefix[1:])
		} else {
			out.RawString(prefix)
		}
		out.String(string(in.Prime))
	}
	{
		const prefix string = ",\"Gen\":"
		if first {
			first = false
			out.RawString(prefix[1:])
		} else {
			out.RawString(prefix)
		}
		out.Int32(int32(in.Gen))
	}
	{
		const prefix string = ",\"FingerPrint\":"
		if first {
			first = false
			out.RawString(prefix[1:])
		} else {
			out.RawString(prefix)
		}
		out.Int64(int64(in.FingerPrint))
	}
	out.RawByte('}')
}

// MarshalJSON supports json.Marshaler interface
func (v dHGroup) MarshalJSON() ([]byte, error) {
	w := jwriter.Writer{}
	easyjson94b2531bEncodeGitRonaksoftwareComRonakSdkRiver2(&w, v)
	return w.Buffer.BuildBytes(), w.Error
}

// MarshalEasyJSON supports easyjson.Marshaler interface
func (v dHGroup) MarshalEasyJSON(w *jwriter.Writer) {
	easyjson94b2531bEncodeGitRonaksoftwareComRonakSdkRiver2(w, v)
}

// UnmarshalJSON supports json.Unmarshaler interface
func (v *dHGroup) UnmarshalJSON(data []byte) error {
	r := jlexer.Lexer{Data: data}
	easyjson94b2531bDecodeGitRonaksoftwareComRonakSdkRiver2(&r, v)
	return r.Error()
}

// UnmarshalEasyJSON supports easyjson.Unmarshaler interface
func (v *dHGroup) UnmarshalEasyJSON(l *jlexer.Lexer) {
	easyjson94b2531bDecodeGitRonaksoftwareComRonakSdkRiver2(l, v)
}
func easyjson94b2531bDecodeGitRonaksoftwareComRonakSdkRiver3(in *jlexer.Lexer, out *RiverConnection) {
	isTopLevel := in.IsStart()
	if in.IsNull() {
		if isTopLevel {
			in.Consumed()
		}
		in.Skip()
		return
	}
	in.Delim('{')
	for !in.IsDelim('}') {
		key := in.UnsafeString()
		in.WantColon()
		if in.IsNull() {
			in.Skip()
			in.WantComma()
			continue
		}
		switch key {
		case "AuthID":
			out.AuthID = int64(in.Int64())
		case "AuthKey":
			if in.IsNull() {
				in.Skip()
			} else {
				copy(out.AuthKey[:], in.Bytes())
			}
		case "UserID":
			out.UserID = int64(in.Int64())
		case "Username":
			out.Username = string(in.String())
		case "Phone":
			out.Phone = string(in.String())
		case "FirstName":
			out.FirstName = string(in.String())
		case "LastName":
			out.LastName = string(in.String())
		default:
			in.SkipRecursive()
		}
		in.WantComma()
	}
	in.Delim('}')
	if isTopLevel {
		in.Consumed()
	}
}
func easyjson94b2531bEncodeGitRonaksoftwareComRonakSdkRiver3(out *jwriter.Writer, in RiverConnection) {
	out.RawByte('{')
	first := true
	_ = first
	{
		const prefix string = ",\"AuthID\":"
		if first {
			first = false
			out.RawString(prefix[1:])
		} else {
			out.RawString(prefix)
		}
		out.Int64(int64(in.AuthID))
	}
	{
		const prefix string = ",\"AuthKey\":"
		if first {
			first = false
			out.RawString(prefix[1:])
		} else {
			out.RawString(prefix)
		}
		out.Base64Bytes(in.AuthKey[:])
	}
	{
		const prefix string = ",\"UserID\":"
		if first {
			first = false
			out.RawString(prefix[1:])
		} else {
			out.RawString(prefix)
		}
		out.Int64(int64(in.UserID))
	}
	{
		const prefix string = ",\"Username\":"
		if first {
			first = false
			out.RawString(prefix[1:])
		} else {
			out.RawString(prefix)
		}
		out.String(string(in.Username))
	}
	{
		const prefix string = ",\"Phone\":"
		if first {
			first = false
			out.RawString(prefix[1:])
		} else {
			out.RawString(prefix)
		}
		out.String(string(in.Phone))
	}
	{
		const prefix string = ",\"FirstName\":"
		if first {
			first = false
			out.RawString(prefix[1:])
		} else {
			out.RawString(prefix)
		}
		out.String(string(in.FirstName))
	}
	{
		const prefix string = ",\"LastName\":"
		if first {
			first = false
			out.RawString(prefix[1:])
		} else {
			out.RawString(prefix)
		}
		out.String(string(in.LastName))
	}
	out.RawByte('}')
}

// MarshalJSON supports json.Marshaler interface
func (v RiverConnection) MarshalJSON() ([]byte, error) {
	w := jwriter.Writer{}
	easyjson94b2531bEncodeGitRonaksoftwareComRonakSdkRiver3(&w, v)
	return w.Buffer.BuildBytes(), w.Error
}

// MarshalEasyJSON supports easyjson.Marshaler interface
func (v RiverConnection) MarshalEasyJSON(w *jwriter.Writer) {
	easyjson94b2531bEncodeGitRonaksoftwareComRonakSdkRiver3(w, v)
}

// UnmarshalJSON supports json.Unmarshaler interface
func (v *RiverConnection) UnmarshalJSON(data []byte) error {
	r := jlexer.Lexer{Data: data}
	easyjson94b2531bDecodeGitRonaksoftwareComRonakSdkRiver3(&r, v)
	return r.Error()
}

// UnmarshalEasyJSON supports easyjson.Unmarshaler interface
func (v *RiverConnection) UnmarshalEasyJSON(l *jlexer.Lexer) {
	easyjson94b2531bDecodeGitRonaksoftwareComRonakSdkRiver3(l, v)
}

const (
	DIGITS        = "0123456789"
	ALPHANUMERICS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
)

// _SplitPQ
// This function used for proof of work to splits PQ to two prime numbers P and Q
func _SplitPQ(pq *big.Int) (p1, p2 *big.Int) {
	value_0 := big.NewInt(0)
	value_1 := big.NewInt(1)
	value_15 := big.NewInt(15)
	value_17 := big.NewInt(17)
	rndmax := big.NewInt(0).SetBit(big.NewInt(0), 64, 1)

	what := big.NewInt(0).Set(pq)
	rnd := mathRand.New(mathRand.NewSource(time.Now().UnixNano()))
	g := big.NewInt(0)
	i := 0
	for !(g.Cmp(value_1) == 1 && g.Cmp(what) == -1) {
		q := big.NewInt(0).Rand(rnd, rndmax)
		q = q.And(q, value_15)
		q = q.Add(q, value_17)
		q = q.Mod(q, what)

		x := big.NewInt(0).Rand(rnd, rndmax)
		whatnext := big.NewInt(0).Sub(what, value_1)
		x = x.Mod(x, whatnext)
		x = x.Add(x, value_1)

		y := big.NewInt(0).Set(x)
		lim := 1 << (uint(i) + 18)
		j := 1
		flag := true

		for j < lim && flag {
			a := big.NewInt(0).Set(x)
			b := big.NewInt(0).Set(x)
			c := big.NewInt(0).Set(q)

			for b.Cmp(value_0) == 1 {
				b2 := big.NewInt(0)
				if b2.And(b, value_1).Cmp(value_0) == 1 {
					c.Add(c, a)
					if c.Cmp(what) >= 0 {
						c.Sub(c, what)
					}
				}
				a.Add(a, a)
				if a.Cmp(what) >= 0 {
					a.Sub(a, what)
				}
				b.Rsh(b, 1)
			}
			x.Set(c)

			z := big.NewInt(0)
			if x.Cmp(y) == -1 {
				z.Add(what, x)
				z.Sub(z, y)
			} else {
				z.Sub(x, y)
			}
			g.GCD(nil, nil, z, what)

			if (j & (j - 1)) == 0 {
				y.Set(x)
			}
			j = j + 1

			if g.Cmp(value_1) != 0 {
				flag = false
			}
		}
		i = i + 1
	}

	p1 = big.NewInt(0).Set(g)
	p2 = big.NewInt(0).Div(what, g)

	if p1.Cmp(p2) == 1 {
		p1, p2 = p2, p1
	}

	return
}

// _GenerateMessageKey
// Message Key is: _Sha512(DHKey[100:140], InternalHeader, Payload)[32:64]
func _GenerateMessageKey(dhKey, plain []byte) []byte {
	// Message Key is: _Sha512(DHKey[100:140], InternalHeader, Payload)[32:64]
	keyBuffer := make([]byte, 40+len(plain))
	copy(keyBuffer, dhKey[100:140])
	copy(keyBuffer[40:], plain)
	if k, err := _Sha512(keyBuffer); err != nil {
		return nil
	} else {
		return k[32:64]

	}
}

// _Encrypt
// Generate MessageKey, AES IV and AES Key:
// 1. Message Key is: _Sha512(dhKey[100:140], plain)[32:64]
// 2. AES IV: _Sha512 (dhKey[180:220], MessageKey)[:32]
// 3. AES KEY: _Sha512 (MessageKey, dhKey[170:210])[:32]
func _Encrypt(dhKey, plain []byte) (encrypted []byte, err error) {
	// Message Key is: _Sha512(DHKey[100:140], InternalHeader, Payload)[32:64]
	msgKey := _GenerateMessageKey(dhKey, plain)

	// AES IV: _Sha512 (DHKey[180:220], MessageKey)[:32]
	iv := make([]byte, 72)
	copy(iv, dhKey[180:220])
	copy(iv[40:], msgKey)
	aesIV, err := _Sha512(iv)
	if err != nil {
		return nil, err
	}

	// AES KEY: _Sha512 (MessageKey, DHKey[170:210])[:32]
	key := make([]byte, 72)
	copy(key, msgKey)
	copy(key[32:], dhKey[170:210])
	aesKey, err := _Sha512(key)
	if err != nil {
		return nil, err
	}

	return _AES256GCMEncrypt(
		aesKey[:32],
		aesIV[:12],
		plain,
	)

}

// _Decrypt
// Decrypts the message:
// 1. AES IV: _Sha512 (dhKey[180:220], MessageKey)[:12]
// 2. AES KEY: _Sha512 (MessageKey, dhKey[170:210])[:32]
func _Decrypt(dhKey, msgKey, encrypted []byte) (plain []byte, err error) {
	// AES IV: _Sha512 (DHKey[180:220], MessageKey)[:32]
	iv := make([]byte, 40, 72)
	copy(iv, dhKey[180:220])
	iv = append(iv, msgKey...)
	aesIV, _ := _Sha512(iv)

	// AES KEY: _Sha512 (MessageKey, DHKey[170:210])[:32]
	key := make([]byte, 32, 72)
	copy(key, msgKey)
	key = append(key, dhKey[170:210]...)
	aesKey, err := _Sha512(key)
	if err != nil {
		return nil, err
	}

	return _AES256GCMDecrypt(
		aesKey[:32],
		aesIV[:12],
		encrypted,
	)
}

// aes256CCMEncrypt encrypts the msg according with key and iv
func _AES256GCMEncrypt(key, iv []byte, msg []byte) ([]byte, error) {
	var block cipher.Block
	if b, err := aes.NewCipher(key); err != nil {
		return nil, err
	} else {
		block = b
	}
	var encrypted []byte
	if aesGCM, err := cipher.NewGCM(block); err != nil {
		return nil, err
	} else {
		encrypted = aesGCM.Seal(msg[:0], iv, msg, nil)
	}
	return encrypted, nil
}

// _AES256GCMDecrypt decrypts the msg according with key and iv
func _AES256GCMDecrypt(key, iv []byte, msg []byte) ([]byte, error) {
	var block cipher.Block
	if b, err := aes.NewCipher(key); err != nil {
		return nil, err
	} else {
		block = b
	}
	var decrypted []byte
	if aesGCM, err := cipher.NewGCM(block); err != nil {
		return nil, err
	} else {
		decrypted, err = aesGCM.Open(nil, iv, msg, nil)
		if err != nil {
			return nil, err
		}
	}
	return decrypted, nil
}

// _Sha256 returns a 32bytes array which is sha256(in)
func _Sha256(in []byte) ([]byte, error) {
	h := sha256.New()
	if _, err := h.Write(in); err != nil {
		return nil, err
	}
	return h.Sum(nil), nil
}

// _Sha512 returns a 64bytes array which is sha512(in)
func _Sha512(in []byte) ([]byte, error) {
	h := sha512.New()
	if _, err := h.Write(in); err != nil {
		return nil, err
	}
	return h.Sum(nil), nil
}

// RandUint64 produces a pseudo-random unsigned number
func _RandomUint64() uint64 {
	return mathRand.Uint64()
}

func _RandomInt63() int64 {
	return mathRand.Int63()
}

// _RandomID generates a pseudo-random string with length 'n' which characters are alphanumerics.
func _RandomID(n int) string {
	b := make([]byte, n)
	for i := range b {
		b[i] = ALPHANUMERICS[mathRand.Intn(len(ALPHANUMERICS))]
	}
	return string(b)
}

var river *River

var (
	no             int
	beforeUnloadCh = make(chan struct{})
	connInfo       string
	duration       int64
)

func main() {
	mathRand.Seed(time.Now().UnixNano())
	river = new(River)

	loadCB := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		connInfo = args[0].String()
		return nil
	})
	defer loadCB.Release()
	js.Global().Get("setLoadConnInfo").Invoke(loadCB)

	initCB := js.FuncOf(initSDK)
	defer initCB.Release()
	js.Global().Get("setInitSDK").Invoke(initCB)

	fnCB := js.FuncOf(fnCall)
	defer fnCB.Release()
	js.Global().Get("setFnCall").Invoke(fnCB)

	receiveCB := js.FuncOf(wsReceive)
	defer receiveCB.Release()
	js.Global().Get("setReceive").Invoke(receiveCB)

	wsOpenCB := js.FuncOf(wsOpen)
	defer wsOpenCB.Release()
	js.Global().Get("setWsOpen").Invoke(wsOpenCB)

	fnEncryptCB := js.FuncOf(fnEncrypt)
	defer fnEncryptCB.Release()
	js.Global().Get("setFnEncrypt").Invoke(fnEncryptCB)

	fnDecryptCB := js.FuncOf(fnDecrypt)
	defer fnDecryptCB.Release()
	js.Global().Get("setFnDecrypt").Invoke(fnDecryptCB)

	<-beforeUnloadCh
	fmt.Println("Bye Wasm !")
}

func initSDK(this js.Value, args []js.Value) interface{} {
	isHttp := uint64(args[0].Int())
	duration = 0
	var startCb Callback = func(time int64) {
		river.ConnInfo.SetServerTime(time)
		js.Global().Call("fnStarted", duration)
	}
	var cb Callback = func(dur int64) {
		duration = dur
		if isHttp == 0 {
			river.SetServerTime(startCb)
		} else {
			js.Global().Call("fnStarted", duration)
		}
	}
	river.Start(connInfo, &cb)
	return nil
}

func fnCall(this js.Value, args []js.Value) interface{} {
	reqId := uint64(args[0].Int())
	constructor := int64(args[1].Int())
	enc, err := base64.StdEncoding.DecodeString(args[2].String())
	if err == nil {
		river.ExecuteRemoteCommand(reqId, constructor, &enc, nil)
	}
	return nil
}

func wsReceive(this js.Value, args []js.Value) interface{} {
	enc, err := base64.StdEncoding.DecodeString(args[0].String())
	if err == nil {
		river.receive(&enc, true)
	}
	return nil
}

func wsOpen(this js.Value, args []js.Value) interface{} {
	river.RetryLast()
	return nil
}

func fnEncrypt(this js.Value, args []js.Value) interface{} {
	reqId := uint64(args[0].Int())
	constructor := int64(args[1].Int())
	enc, err := base64.StdEncoding.DecodeString(args[2].String())
	if err == nil {
		river.ExecuteEncrypt(reqId, constructor, &enc)
	}
	return nil
}

func fnDecrypt(this js.Value, args []js.Value) interface{} {
	enc, err := base64.StdEncoding.DecodeString(args[0].String())
	if err == nil {
		river.receive(&enc, false)
	}
	return nil
}

func beforeUnload(event js.Value) {
	beforeUnloadCh <- struct{}{}
}
