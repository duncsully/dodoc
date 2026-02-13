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
- [x] Basic search/filter documents
- [x] View document
- [x] Create and edit documents
  - [x] Preview mode (rendered markdown)
- [x] Delete documents
- [x] Share documents with other users
  - [x] Show sharing info
- [ ] Reminders as push notifications
- [x] User profile (avatar, visibility etc.)
  - [x] User name (and show in shared document list)
  - [ ] Change email and password
- [ ] Responsive design using fixed width ion-grid
- [x] Make sure logout is working reliably

## Someday

- [ ] Recurring reminders
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
- [x] Copy document (e.g. for templates, or offline edits before conflict resolution)
- [ ] Decline shared document^
- [ ] Tags for documents@
- [ ] Search query syntax (and, or, title, content, exact, starts with, created before/after etc.)
  - [ ] Saved queries (either as home view filters and/or embeddable in documents?)
- [ ] Lookup and automatically link documents in editor
- [x] Syntax to embed documents within documents (yo dawg I heard you like documents...)
- [ ] Table styles in markdown
- [x] Show found text in search results list with context and highlights
- [ ] Download document as markdown file
- [ ] Image uploads in editor
- [ ] Per user document notification settings
  - [ ] Notify shared users when a document is updated option
- [ ] Combined details and edit view?

## Polish

- [ ] Better home view loading state
- [ ] Better empty state for no documents
- [ ] Better spacing in signup form for error messages?
- [ ] Better error handling in login forms?
- [ ] If user hides their profile after having documents shared with them, what then?
- [ ] Show user avatar for user menu button
- [ ] Segment buttons (tabs) don't look great with M3 overrides (currently not using)
- [ ] Better empty state for document view with no content
- [ ] More sharing info in document view (who has access, avatars?)
- [ ] Hide markdown in search result snippets?
- [ ] Show user avatars in share input?
- [ ] Style hrs?
- [ ] Render details-summary as accordion?
- [ ] Style datetime pickers to match theme

## DX

- [ ] Better styling solution
- [ ] Fix custom element manifest not working?
- [ ] Bun instead of Node once supported on Windows ARM?
- [ ] Typegen on hooks?
- [ ] Export reactive getter type from solit-html

~ I could use Dexie or a local DB to cache documents offline, maybe readonly as a first step. Instead of fetching for all documents, the client could fetch only updated documents since last sync and update the local cache. On document view, it could load from local cache first, then update from server in background. In another iteration, I could support locally created documents that sync when back online. Finally, I could think about conflict resolution for supporting offline edits.

^ Might need to wait until permission table instead of shared multi-select field so that I can more easily give a user the auth to delete their record for a shared document. Might also want to inform user when a document has been shared with them and let them accept/decline.

@ For the time being, full text search allows user-implemented tags using their own syntax like @tag. I'll revisit implementing tags as a first-class feature after I understand this approach's limitations.
