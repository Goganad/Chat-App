package main

import (
	"github.com/Goganad/Chat-App/server/bootstrap"
	"github.com/Goganad/Chat-App/server/chatapi"
)

func main() {
	bootstrap.StartHttpServer()
	chatapi.Setup()
	bootstrap.ListenForSignals()
}
