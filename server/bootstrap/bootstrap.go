package bootstrap

import (
	"context"
	"fmt"
	"github.com/Goganad/Chat-App/server/config"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

var mux = new(http.ServeMux)
var NetworkMessagesChannel = make(chan NetworkMessage)

var server = http.Server{
	Addr:    config.ServerAddress,
	Handler: mux,
}

var PendingConnections pendingConnectionsType

var MaintenanceRoutines MaintenanceRoutine

var signals = make(chan os.Signal, 1)

var webSocketUpgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h HttpHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, err := webSocketUpgrader.Upgrade(w, r, nil)

	if err != nil {
		panic(err)
	}

	fmt.Println("New conn", conn.RemoteAddr().String())

	if PendingConnections.GetConnCount() < config.MaxHandshakeConnections {
		PendingConnections.AddConnection(conn)
		go readSocket(conn)
	} else {
		_ = conn.Close()
	}
}

func ListenForSignals() {
	_ = <-signals
	log.Println("Terminating")
	MaintenanceRoutines.TerminateAll()
	_ = server.Shutdown(context.Background())
}

func StartHttpServer() {
	signal.Notify(signals, syscall.SIGTERM, syscall.SIGINT)

	PendingConnections.Init()
	MaintenanceRoutines.StartFunc(PendingConnections.CheckPendingConnections)
	MaintenanceRoutines.StartFunc(networkWriter)

	go func() {
		log.Fatal(server.ListenAndServe())
	}()
}

func AddEndPoints(endPoint string, handlers *HttpHandler) {
	mux.Handle(endPoint, handlers)
}

func networkWriter(signalChannel <-chan Void, args ...interface{}) {
	var m NetworkMessage
	for {
		select {

		case <-signalChannel:
			break

		case m = <-NetworkMessagesChannel:
			if m.IsControl {
				err := m.Conn.WriteControl(websocket.PingMessage, []byte("PING"), time.Now().Add(time.Second*10))
				m.ResultCh <- err
			} else {
				_ = m.Conn.WriteJSON(m.Jsonable)
			}
		}
	}
}
