# Firestore Setup Instructions

## Issue: Missing Database Indexes

Your app is working but needs Firestore indexes created for query operations.

## Quick Fix:

1. **Open your browser console** (press F12) while the app is running
2. **Look for errors** that say "The query requires an index. You can create it here: https://..."
3. **Click the link** in the error message - it will take you directly to Firebase Console
4. **Click "Create Index"** button
5. **Wait 1-2 minutes** for the index to build

## Manual Setup (if needed):

Go to Firebase Console > Firestore Database > Indexes and create these:

### Collection: `tasks`
- **Index 1**: 
  - Field: `userId` (Ascending)
  - Field: `createdAt` (Descending)
  
- **Index 2**:
  - Field: `userId` (Ascending)  
  - Field: `status` (Ascending)
  - Field: `createdAt` (Descending)

- **Index 3**:
  - Field: `userId` (Ascending)
  - Field: `category` (Ascending)
  - Field: `createdAt` (Descending)

- **Index 4**:
  - Field: `userId` (Ascending)
  - Field: `urgency` (Ascending)
  - Field: `createdAt` (Descending)

## What's Working Now:

✅ Firebase connection
✅ Subtasks feature
✅ Task templates
✅ Duplicate task
✅ All UI components

## Once Indexes are Created:

Your app will be fully functional and you'll be able to:
- View all tasks
- Filter by status, category, urgency
- Create tasks with templates
- Add/manage subtasks
- Duplicate tasks
