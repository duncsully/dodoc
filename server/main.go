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
)

//go:embed dist/**
var distDir embed.FS

var DistDirFS, _ = fs.Sub(distDir, "dist")

func main() {
	app := pocketbase.New()

	app.OnBootstrap().BindFunc(func(e *core.BootstrapEvent) error {
		if err := e.Next(); err != nil {
			return err
		}

		// Check for existing VAPID keys, else generate and save them
		_, missing := app.FindRecordById("key_values", "vapid_public_key")
		if missing != nil {
			log.Default().Println("Generating new VAPID keys...")
			private_key, public_key, err := webpush.GenerateVAPIDKeys()
			if err != nil {
				return err
			}
			key_values, err := app.FindCollectionByNameOrId("key_values")
			if err != nil {
				return err
			}
			app.RunInTransaction(func(txApp core.App) error {
				public_key_record := core.NewRecord(key_values)
				public_key_record.Set("id", "vapid_public_key")
				public_key_record.Set("value", public_key)
				public_key_record.Set("public", true)
				if err := txApp.Save(public_key_record); err != nil {
					return err
				}
				private_key_record := core.NewRecord(key_values)
				private_key_record.Set("id", "vapid_private_key")
				private_key_record.Set("value", private_key)
				if err := txApp.Save(private_key_record); err != nil {
					return err
				}
				return nil
			})
		}

		return nil
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
