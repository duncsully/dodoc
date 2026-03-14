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
  - [x] Generate VAPID keys and send public one
  - [x] Request permission in UI and save data to DB
  - [x] Table for reminders
  - [ ] UI to set a reminder datetime
  - [ ] Server job to check for reminders, send notifications
  - [ ] Remove subscription if rejected?
- [x] User profile (avatar, visibility etc.)
  - [x] User name (and show in shared document list)
  - [ ] Change email and password
- [ ] Responsive design using fixed width ion-grid
- [x] Make sure logout is working reliably

## Someday

- [ ] Recurring reminders
  - [ ] Multiple recurring reminders?+
- [ ] Local-only docs and/or end-to-end encryption?
- [ ] PWA (would want to move service worker registration)
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
  - [ ] Owner option to sync shared users, and shared users can opt out after being synced
  - [ ] Notify shared users when a document is updated option
- [ ] Combined details and edit view?
- [ ] Auto save?
- [ ] MD cheat sheet?

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
- [ ] Push permission handling%
- [ ] Cancel notifications on all other devices after clicking on one device?

## DX

- [ ] Better styling solution
- [ ] Fix custom element manifest not working?
- [ ] Bun instead of Node once supported on Windows ARM?
- [ ] Typegen on hooks?
- [ ] Export reactive getter type from solit-html
- [ ] Use Tanstack DB

~ I could use Dexie or a local DB to cache documents offline, maybe readonly as a first step. Instead of fetching for all documents, the client could fetch only updated documents since last sync and update the local cache. On document view, it could load from local cache first, then update from server in background. In another iteration, I could support locally created documents that sync when back online. Finally, I could think about conflict resolution for supporting offline edits.

^ Might need to wait until permission table instead of shared multi-select field so that I can more easily give a user the auth to delete their record for a shared document. Might also want to inform user when a document has been shared with them and let them accept/decline.

@ For the time being, full text search allows user-implemented tags using their own syntax like @tag. I'll revisit implementing tags as a first-class feature after I understand this approach's limitations.

% I could signalize whether the browser currently has push permissions and use that to update the UI. If we don't have permission yet, we'd likely want to display a little info dialog to the user explaining that we need permission in order for reminders to work (in the webapp) and that they'll need to accept the prompt, otherwise we don't let them continue setting a reminder.

+ Right now I have a unique index constraint on user + document determining that a user should only have one reminder configuration per document, and we'd likely get all of the recurrences we need within this single config, but maybe if that still ends up too limiting and we need something even more flexible we could allow setting up multiple reminder configs per document?
