package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha256"
	"crypto/sha512"
	"math/big"
	mathRand "math/rand"
	"time"
)

const (
	DIGITS        = "0123456789"
	ALPHANUMERICS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	bitSize       = 2048
	SrpByteSize   = bitSize / 8
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

func H(data ...[]byte) []byte {
	h := sha256.New()
	for _, d := range data {
		h.Write(d)
	}
	return h.Sum(nil)
}

func SH(data, salt []byte) []byte {
	b := make([]byte, 0, len(data)+2*len(salt))
	b = append(b, salt...)
	b = append(b, data...)
	b = append(b, salt...)
	return H(b)
}

func PH1(password, salt1, salt2 []byte) []byte {
	return SH(SH(password, salt1), salt2)
}

func PH2(password, salt1, salt2 []byte) []byte {
	return SH(SH(PH1(password, salt1, salt2), salt1), salt2)
}

func K(p, g *big.Int) []byte {
	return H(append(Pad(p), Pad(g)...))
}

func U(ga, gb *big.Int) []byte {
	return H(append(Pad(ga), Pad(gb)...))
}

func M(p, g *big.Int, s1, s2 []byte, ga, gb, sb *big.Int) []byte {
	return H(H(Pad(p)), H(Pad(g)), H(s1), H(s2), H(Pad(ga)), H(Pad(gb)), H(Pad(sb)))
}

// Pad x to n bytes if needed
func Pad(x *big.Int) []byte {
	b := x.Bytes()
	if len(b) < SrpByteSize {
		z := SrpByteSize - len(b)
		p := make([]byte, SrpByteSize)
		for i := 0; i < z; i++ {
			p[i] = 0
		}

		copy(p[z:], b)
		b = p
	}
	return b
}
