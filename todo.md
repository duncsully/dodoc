# TODO

## Setup

- [x] Init repo
- [x] Init client dir with Vite
- [x] Install solit-html
- [x] Install M3E
- [x] Install marked.js
- [x] Figure out backend (Pocketbase)
- [x] Start documents table
- [x] Embed client SPA into BE executable

## MVP features

- [x] User auth (signup, login)
- [x] Logout
- [x] List documents
- [ ] Basic search/filter documents
- [x] View document
- [x] Create and edit documents
  - [ ] Preview mode (rendered markdown)
- [x] Delete documents
  - [ ] From home view
- [x] Share documents with other users
  - [ ] Show sharing info
- [ ] Tags for documents
- [ ] Reminders as push notifications
- [ ] User profile (change email, password, avatar, visibility etc.)
  - [ ] User name (and show in shared document list)

## Someday

- [ ] Local-only docs and/or end-to-end encryption?
- [ ] PWA
- [ ] Offline support~
  - [ ] Service worker load updates in background
- [ ] Android app
  - [ ] Local scheduled notifications
- [ ] API endpoint for posting new document via raw file upload? (e.g. from Supernote save?)
- [ ] Configurably disable sign up form?
- [ ] Two-pane view in larger screens (document list + document view)
- [ ] Archive documents (only findable via "show archived" filter)
- [ ] MD extensions
- [ ] Soft delete with undo, cron job to purge
- [ ] Copy document (e.g. for templates, or offline edits before conflict resolution)
- [ ] Decline shared document^

## Polish

- [ ] Better home view loading state
- [ ] Better empty state for no documents
- [ ] Better spacing in signup form for error messages?
- [ ] Better error handling in login forms?

## DX

- [ ] Better styling solution
- [ ] Fix custom element manifest not working?
- [ ] Bun instead of Node once supported on Windows ARM?
- [ ] Typegen on hooks?
- [ ] Export reactive getter type from solit-html

~ I could use Dexie or a local DB to cache documents offline, maybe readonly as a first step. Instead of fetching for all documents, the client could fetch only updated documents since last sync and update the local cache. On document view, it could load from local cache first, then update from server in background. In another iteration, I could support locally created documents that sync when back online. Finally, I could think about conflict resolution for supporting offline edits.

^ Might need to wait until permission table instead of shared multi-select field so that I can more easily give a user the auth to delete their record for a shared document. Might also want to inform user when a document has been shared with them and let them accept/decline.
