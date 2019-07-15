package main

import (
	"syscall/js"
	"fmt"
	"encoding/base64"
	"math/rand"
	"time"
)

var river *River

var (
	no             int
	beforeUnloadCh = make(chan struct{})
	connInfo       string
	duration       int64
)

func main() {
	rand.Seed(time.Now().UnixNano())
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

func fnCall(this js.Value, inps []js.Value) interface{} {
	go func(args []js.Value) {
		reqId := uint64(args[0].Int())
		constructor := int64(args[1].Int())
		enc, err := base64.StdEncoding.DecodeString(args[2].String())
		if err == nil {
			river.ExecuteRemoteCommand(reqId, constructor, &enc, nil)
		}
	}(inps)
	return nil
}

func wsReceive(this js.Value, inps []js.Value) interface{} {
	go func(args []js.Value) {
		enc, err := base64.StdEncoding.DecodeString(args[0].String())
		if err == nil {
			river.receive(&enc, true)
		}
	}(inps)
	return nil
}

func wsOpen(this js.Value, args []js.Value) interface{} {
	river.RetryLast()
	return nil
}

func fnEncrypt(this js.Value, inps []js.Value) interface{} {
	go func(args []js.Value) {
		reqId := uint64(args[0].Int())
		constructor := int64(args[1].Int())
		enc, err := base64.StdEncoding.DecodeString(args[2].String())
		if err == nil {
			river.ExecuteEncrypt(reqId, constructor, &enc)
		}
	}(inps)
	return nil
}

func fnDecrypt(this js.Value, inps []js.Value) interface{} {
	go func(args []js.Value) {
		enc, err := base64.StdEncoding.DecodeString(args[0].String())
		if err == nil {
			river.receive(&enc, false)
		}
	}(inps)
	return nil
}

func beforeUnload(event js.Value) {
	beforeUnloadCh <- struct{}{}
}
