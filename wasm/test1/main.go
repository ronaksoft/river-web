package main

import (
	"syscall/js"
	"fmt"
	"encoding/base64"
	"time"
	"strings"
)

func main() {
	initLog()
	_SDK := new(River)
	_SDK.SetConfig(&RiverConfig{
		ServerEndpoint:     "ws://river.im",
		ServerKeysFilePath: "./keys.json",
	})

	_SDK.Start()

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

func beforeUnload(event js.Value) {
	beforeUnloadCh <- struct{}{}
}

func getUint8(str string) (u uint8) {
	u = 0
	for _, ch := range []byte(str) {
		ch -= '0'
		if ch > 9 {
			return 0
		}
		u = u*10 + uint8(ch)
	}
	return
}

func getByteSliceFromUint8(val *js.Value) (slice []byte) {
	t := time.Now().UnixNano()
	for _, num := range strings.Split((*val).String(), ",") {
		slice = append(slice, byte(getUint8(num)))
	}
	fmt.Println(time.Now().UnixNano() - t)
	return
}
