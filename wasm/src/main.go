package main

import (
	"encoding/base64"
	"fmt"
	"git.ronaksoft.com/river/msg/go/msg"
	"math/rand"
	"strconv"
	"syscall/js"
	"time"
)

var river *River

var (
	no             int
	beforeUnloadCh = make(chan struct{})
	connInfo       string
	serverPubKeys  string
	duration       int64
)

func main() {
	rand.Seed(time.Now().UnixNano())
	river = new(River)

	loadCB := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		connInfo = args[0].String()
		serverPubKeys = args[1].String()
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

	fnGenSrpHashCB := js.FuncOf(fnGenSrpHash)
	defer fnGenSrpHashCB.Release()
	js.Global().Get("setFnGenSrpHash").Invoke(fnGenSrpHashCB)

	fnGenInputPasswordCB := js.FuncOf(fnGenInputPassword)
	defer fnGenInputPasswordCB.Release()
	js.Global().Get("setFnGenInputPassword").Invoke(fnGenInputPasswordCB)

	<-beforeUnloadCh
	fmt.Println("Bye Wasm !")
}

func initSDK(this js.Value, args []js.Value) interface{} {
	timeInput := uint64(args[0].Int())
	duration = 0
	var startCb Callback = func(time2 int64) {
		river.ConnInfo.SetServerTime(time2)
		js.Global().Call("fnStarted", duration, time2)
	}
	var cb Callback = func(dur int64) {
		duration = dur
		if timeInput == 0 {
			river.SetServerTime(startCb)
		} else {
			if timeInput != 1 {
				river.ConnInfo.SetServerTime(int64(timeInput))
			}
			js.Global().Call("fnStarted", duration, timeInput)
		}
	}
	river.Start(connInfo, serverPubKeys, &cb)
	return nil
}

func fnCall(this js.Value, inps []js.Value) interface{} {
	go func(args []js.Value) {
		reqId := uint64(args[0].Int())
		constructor := int64(args[1].Int())
		enc, err := base64.StdEncoding.DecodeString(args[2].String())
		var inputTeam *msg.InputTeam
		if len(args) > 4 {
			teamId, _ := strconv.ParseInt(args[3].String(), 10, 0)
			teamAccessHash, _ := strconv.ParseUint(args[4].String(), 10, 0)
			if teamId != 0 && teamAccessHash != 0 {
				inputTeam = &msg.InputTeam{
					ID:         teamId,
					AccessHash: teamAccessHash,
				}
			}
		}
		if err == nil {
			river.ExecuteRemoteCommand(reqId, constructor, &enc, inputTeam, nil)
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
		var inputTeam *msg.InputTeam
		if len(args) > 4 {
			teamId, _ := strconv.ParseInt(args[3].String(), 10, 0)
			teamAccessHash, _ := strconv.ParseUint(args[4].String(), 10, 0)
			if teamId != 0 && teamAccessHash != 0 {
				inputTeam = &msg.InputTeam{
					ID:         teamId,
					AccessHash: teamAccessHash,
				}
			}
		}
		if err == nil {
			river.ExecuteEncrypt(reqId, constructor, inputTeam, &enc)
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

func fnGenSrpHash(this js.Value, inps []js.Value) interface{} {
	go func(args []js.Value) {
		id := args[0].Int()
		pass, err := base64.StdEncoding.DecodeString(args[1].String())
		algorithm := args[2].Int()
		algorithmData, err2 := base64.StdEncoding.DecodeString(args[3].String())
		if err == nil && err2 == nil {
			res := river.GenSrpHash(pass, int64(algorithm), algorithmData)
			js.Global().Call("fnGenSrpHashCallback", id, base64.StdEncoding.EncodeToString(res))
		}
	}(inps)
	return nil
}

func fnGenInputPassword(this js.Value, inps []js.Value) interface{} {
	go func(args []js.Value) {
		id := args[0].Int()
		pass, err := base64.StdEncoding.DecodeString(args[1].String())
		accountPass, err2 := base64.StdEncoding.DecodeString(args[2].String())
		if err != nil {
			fmt.Println(err)
		}
		if err2 != nil {
			fmt.Println(err2)
		}
		if err == nil && err2 == nil {
			res := river.GenInputPassword(pass, accountPass)
			js.Global().Call("fnGenInputPasswordCallback", id, base64.StdEncoding.EncodeToString(res))
		}
	}(inps)
	return nil
}

func beforeUnload(event js.Value) {
	beforeUnloadCh <- struct{}{}
}
