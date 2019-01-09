package main

import (
	"go.uber.org/zap"
	"os"
	"go.uber.org/zap/zapcore"
)

var (
	_LOG       *zap.Logger
	_LOG_LEVEL zap.AtomicLevel
)

func initLog() {
	_LOG_LEVEL = zap.NewAtomicLevelAt(zap.InfoLevel)
	logConfig := zap.NewProductionConfig()
	logConfig.Encoding = "console"
	logConfig.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	logConfig.EncoderConfig.EncodeDuration = zapcore.StringDurationEncoder
	logConfig.Level = _LOG_LEVEL
	if l, err := logConfig.Build(); err != nil {
		os.Exit(1)
	} else {
		_LOG = l
	}

}

func SetLogLevel(l int) {
	_LOG_LEVEL.SetLevel(zapcore.Level(l))
}
