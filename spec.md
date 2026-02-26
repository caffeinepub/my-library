# My Library

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Personal book cataloging app installable as a PWA on Android devices
- Book entries with: title, author, genre, reading status (Want to Read / Reading / Read), rating (1-5 stars), notes, cover image URL
- Add, edit, and delete books
- Filter/search books by title, author, genre, or reading status
- Book collection overview with stats (total books, read count, currently reading)
- PWA manifest and service worker for Android home screen installation

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: store book entries per user (title, author, genre, status, rating, notes, coverUrl, dateAdded)
2. Backend: CRUD operations -- addBook, updateBook, deleteBook, getBooks, getBook
3. Frontend: PWA setup (manifest.json, service worker registration)
4. Frontend: Home/dashboard view with stats and book grid
5. Frontend: Add/Edit book form (modal or page)
6. Frontend: Book detail view
7. Frontend: Filter/search bar by status, genre, and text search

## UX Notes
- Mobile-first design optimized for Android screens
- Bottom navigation bar for easy thumb access
- Card-based book grid with cover thumbnails
- Status pills (Want to Read / Reading / Read) with distinct colors
- Star rating component
- Smooth transitions between views
- Install prompt banner for Android PWA installation
