package main

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
}

// NewRiverConnection
func NewRiverConnection(r *River) *RiverConnection {
	rc := new(RiverConnection)
	if err := rc.Load(); err != nil {
		rc.Save()
	}
	return rc
}

// Save
func (v *RiverConnection) Save() {
	_LOG.Debug("RiverConnection Save")
	//if bytes, err := v.MarshalJSON(); err != nil {
	//    _LOG.Info(err.Error(),
	//        zap.String(_LK_FUNC_NAME, "RiverConnection::Save"),
	//    )
	//} else if err := _Model.System.SaveString(_CN_CONN_INFO, string(bytes)); err != nil {
	//    _LOG.Info(err.Error(),
	//        zap.String(_LK_FUNC_NAME, "RiverConnection::Save"),
	//    )
	//}
}

// Load
func (v *RiverConnection) Load() error {
	_LOG.Debug("RiverConnection Load")
	//if kv, err := _Model.System.LoadString(_CN_CONN_INFO); err != nil {
	//    _LOG.Info(err.Error())
	//    return err
	//} else if err := v.UnmarshalJSON([]byte(kv)); err != nil {
	//    _LOG.Error(err.Error(),
	//        zap.String(_LK_FUNC_NAME, "RiverConnection::Load"),
	//    )
	//    return err
	//}
	return nil
}
