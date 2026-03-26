package main

import (
	"embed"
	"encoding/json"
	"io/fs"
	"log"
	"net/http"

	"github.com/SherClockHolmes/webpush-go"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/osutils"

	_ "dodoc/migrations"
)

//go:embed dist/**
var distDir embed.FS

var DistDirFS, _ = fs.Sub(distDir, "dist")

func main() {
	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// enable auto creation of migration files when making collection changes in the Dashboard
		Automigrate: osutils.IsProbablyGoRun(),
	})

	app.Cron().MustAdd("check reminders", "* * * * *", func() {
		// Check for upcoming reminders and send notifications
		// Compare start column minute matches the current minute
		records, err := app.FindAllRecords("reminders", dbx.NewExp("strftime('%Y-%m-%d %H:%M', start) = strftime('%Y-%m-%d %H:%M', 'now')"))
		if err != nil {
			log.Fatal(err)
		}
		for _, record := range records {
			userId := record.GetString("user")
			documentId := record.GetString("document")
			document, err := app.FindRecordById("documents", documentId)
			if err != nil {
				log.Fatal(err)
			}

			notif := &Notification{
				Title: "Reminder",
				Body:  document.GetString("title"),
				Data:  NotificationData{DocID: documentId},
			}
			if err := sendPush(app, userId, notif); err != nil {
				log.Println(err)
			}
		}
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.POST("/api/test-notification", func(e *core.RequestEvent) error {
			userId := e.Auth.Id
			notif := &Notification{
				Title: "Test Notification",
				Body:  "This is a test notification",
				Data:  NotificationData{DocID: "test"},
			}
			if err := sendPush(app, userId, notif); err != nil {
				return err
			}
			return e.NoContent(http.StatusNoContent)
		}).Bind(apis.RequireAuth())

		se.Router.GET("/{path...}", apis.Static(DistDirFS, true))
		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

type NotificationData struct {
	DocID string `json:"docId,omitempty"`
}

type Notification struct {
	Title string           `json:"title,omitempty"`
	Body  string           `json:"body,omitempty"`
	Data  NotificationData `json:"data"`
}

func sendPush(app *pocketbase.PocketBase, userId string, notif *Notification) error {
	publicKey, err := app.FindRecordById("key_values", "vapid_public_key")
	if err != nil {
		return err
	}
	privateKey, err := app.FindRecordById("key_values", "vapid_private_key")
	if err != nil {
		return err
	}
	records, err := app.FindAllRecords("push_subscriptions", dbx.HashExp{"user": userId})
	if err != nil {
		return err
	}
	// Send test notification to all subscribed devices
	for _, record := range records {
		s := &webpush.Subscription{}
		record.UnmarshalJSONField("subscription", &s)

		payload, err := json.Marshal(notif)
		resp, err := webpush.SendNotification(payload, s, &webpush.Options{
			VAPIDPublicKey:  publicKey.GetString("value"),
			VAPIDPrivateKey: privateKey.GetString("value"),
		})
		if err != nil {
			return err
		}
		defer resp.Body.Close()
	}
	return nil
}
