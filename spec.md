# My Library

## Current State
The project previously had a personal library book cataloging PWA with barcode scanning via camera. The draft has expired and needs to be rebuilt.

## Requested Changes (Diff)

### Add
- Full book catalog app with add/edit/delete books
- Book fields: title, author, genre, reading status, notes, ISBN, cover image URL
- Barcode/ISBN scanner using device camera (QR-code component)
- Auto-fill book details from Open Library API by ISBN
- Mobile-friendly PWA layout
- Book list view with search and filter by status/genre
- Book detail/edit modal

### Modify
- N/A (fresh rebuild)

### Remove
- N/A (fresh rebuild)

## Implementation Plan
1. Select `qr-code` and `http-outcalls` components for barcode scanning and Open Library API lookups
2. Generate Motoko backend with book CRUD operations
3. Build React frontend with:
   - Book list page with search/filter
   - Add/Edit book modal with barcode scan button
   - Camera-based ISBN scanner using qr-code component
   - HTTP outcall to Open Library API to auto-fill book metadata
   - PWA manifest for Android home screen installation
