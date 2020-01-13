package main

import (
	"fmt"
	"strconv"
	"syscall/js"
	"time"
)

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

	if bytes, err := vv.MarshalJSON(); err != nil {
		fmt.Println(err.Error(), "RiverConnection::Save")
	} else {
		js.Global().Call("saveConnInfo", string(bytes))
	}
}

// Load
func (v *RiverConnection) Load(connInfo string) error {
	var vv = RiverConnectionJS{}
	if err := vv.UnmarshalJSON([]byte(connInfo)); err != nil {
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
