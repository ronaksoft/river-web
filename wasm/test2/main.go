package main

import (
	"syscall/js"
	"fmt"
	"encoding/base64"
)

var river *River

func main() {
	initLog()
	river = new(River)
	river.Start()

	dhCB := js.NewCallback(setDH)
	defer dhCB.Release()
	setDH := js.Global().Get("setDH")
	setDH.Invoke(dhCB)

	encCB := js.NewCallback(encrypt)
	defer encCB.Release()
	setEncrypt := js.Global().Get("setEncrypt")
	setEncrypt.Invoke(encCB)

	decCB := js.NewCallback(decrypt)
	defer decCB.Release()
	setDecrypt := js.Global().Get("setDecrypt")
	setDecrypt.Invoke(decCB)

	receiveCB := js.NewCallback(wsReceive)
	defer receiveCB.Release()
	setReceive := js.Global().Get("setReceive")
	setReceive.Invoke(receiveCB)

	beforeUnloadCb := js.NewEventCallback(0, beforeUnload)
	defer beforeUnloadCb.Release()
	addEventListener := js.Global().Get("addEventListener")
	addEventListener.Invoke("beforeunload", beforeUnloadCb)

	<-beforeUnloadCh
	fmt.Println("Bye Wasm !")
}

func setDH(args []js.Value) {
	//dh = getByteSliceFromUint8(&args[0])
	dh, _ = base64.StdEncoding.DecodeString(args[0].String())
	river.CreateAuthKey()
}

func encrypt(args []js.Value) {
	plain := []byte(args[0].String())
	no++
	enc, err := _Encrypt(dh, plain)
	if err == nil {
		js.Global().Call("decCB", js.TypedArrayOf(enc))
		fmt.Println(string(enc))
	}
}

func decrypt(args []js.Value) {
	enc, _ := base64.StdEncoding.DecodeString(args[0].String())
	msgKey := enc[0:32]
	enc = enc[32:]
	no++
	plain, err := _Decrypt(dh, msgKey, enc)
	if err == nil {
		fmt.Println(string(plain))
	} else {
		fmt.Println(err.Error())
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
