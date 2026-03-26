package migrations

import (
	"log"

	"github.com/SherClockHolmes/webpush-go"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/migrations"
)

func init() {
	migrations.Register(func(app core.App) error {
		// Check for existing VAPID public key
		_, err := app.FindRecordById("key_values", "vapid_public_key")
		if err == nil {
			// Key already exists, nothing to do
			return nil
		}

		log.Println("Generating new VAPID keys (migration)...")
		privateKey, publicKey, err := webpush.GenerateVAPIDKeys()
		if err != nil {
			return err
		}

		keyValuesColl, err := app.FindCollectionByNameOrId("key_values")
		if err != nil {
			return err
		}

		publicKeyRecord := core.NewRecord(keyValuesColl)
		publicKeyRecord.Set("id", "vapid_public_key")
		publicKeyRecord.Set("value", publicKey)
		publicKeyRecord.Set("public", true)
		if err := app.Save(publicKeyRecord); err != nil {
			return err
		}

		privateKeyRecord := core.NewRecord(keyValuesColl)
		privateKeyRecord.Set("id", "vapid_private_key")
		privateKeyRecord.Set("value", privateKey)
		if err := app.Save(privateKeyRecord); err != nil {
			return err
		}

		return nil
	}, nil)
}
