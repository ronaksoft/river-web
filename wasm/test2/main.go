package main

import (
	"syscall/js"
	"fmt"
	"encoding/base64"
	"git.ronaksoftware.com/customers/river/messages"
	"math/rand"
	"time"
)

var river *River

var (
	no             int
	beforeUnloadCh = make(chan struct{})
	connInfo       string
)

func main() {
	rand.Seed(time.Now().UnixNano())
	initLog()
	river = new(River)

	loadCB := js.NewCallback(func(args []js.Value) {
		connInfo = args[0].String()
	})
	defer loadCB.Release()
	js.Global().Get("loadConnInfo").Invoke(loadCB)

	initCB := js.NewCallback(initSDK)
	defer initCB.Release()
	js.Global().Get("initSDK").Invoke(initCB)

	fnCB := js.NewCallback(fnCall)
	defer fnCB.Release()
	js.Global().Get("setFnCall").Invoke(fnCB)

	receiveCB := js.NewCallback(wsReceive)
	defer receiveCB.Release()
	js.Global().Get("setReceive").Invoke(receiveCB)

	beforeUnloadCb := js.NewEventCallback(0, beforeUnload)
	defer beforeUnloadCb.Release()
	addEventListener := js.Global().Get("addEventListener")
	addEventListener.Invoke("beforeunload", beforeUnloadCb)

	<-beforeUnloadCh
	fmt.Println("Bye Wasm !")
}

func initSDK(args []js.Value) {
	river.Start(connInfo)
}

func fnCall(args []js.Value) {
	reqId := uint64(args[0].Int())
	constructor := int64(args[1].Int())
	enc, err := base64.StdEncoding.DecodeString(args[2].String())
	if err == nil {
		river.ExecuteRemoteCommand(reqId, constructor, enc, nil, func(m *msg.MessageEnvelope) {
			js.Global().Call("fnCallback", m.RequestID, m.Constructor, js.TypedArrayOf(m.Message))
		})
	}
}

func wsReceive(args []js.Value) {
	enc, err := base64.StdEncoding.DecodeString(args[0].String())
	if err == nil {
		river.receive(&enc)
	}
}

func beforeUnload(event js.Value) {
	beforeUnloadCh <- struct{}{}
}
