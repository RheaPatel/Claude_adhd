# ADHD Task Manager

A React Native mobile application designed to help users with ADHD manage tasks effectively through smart categorization, urgency learning, wellness check-ins, and contextual reminders.

## Features

### Phase 1 - Foundation (✅ COMPLETE)
- ✅ User authentication (email/password)
- ✅ Basic task CRUD (Create, Read, Update, Delete)
- ✅ Task categorization (work, health, shopping, personal, social, other)
- ✅ Urgency levels (critical, high, medium, low)
- ✅ Offline-first architecture with React Query
- ✅ Real-time sync with Firebase Firestore

### Phase 2 - Coming Soon
- Auto-categorization using keyword matching
- Urgency suggestions
- Task filtering and sorting

### Phase 3 - Coming Soon
- Push notifications
- Wellness check-ins (hydration, meals, breaks)
- Custom notification schedules

### Phase 4 - Coming Soon
- Urgency learning system
- Pattern-based suggestions
- Learning dashboard

### Phase 5 - Coming Soon
- Contextual reminders (Christmas shopping, etc.)
- Event-based triggers
- Task accumulation alerts

## Tech Stack

- **Frontend**: React Native with Expo, TypeScript
- **State Management**: Zustand (client state), React Query (server state)
- **Backend**: Firebase (Auth, Firestore, Cloud Functions, FCM)
- **UI Library**: React Native Paper
- **Navigation**: React Navigation v6

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Firebase account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd ADHDapp
npm install
```

### 2. Firebase Configuration

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Once created, click on "Web" icon to add a web app
4. Copy your Firebase configuration

#### Enable Firebase Services

**Authentication:**
1. Go to Authentication > Sign-in method
2. Enable "Email/Password" provider

**Firestore Database:**
1. Go to Firestore Database
2. Click "Create database"
3. Start in **test mode** (for development)
4. Choose a location close to your users

**Cloud Messaging (for push notifications):**
1. Go to Project Settings > Cloud Messaging
2. Note your Sender ID

#### Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase credentials in `.env`:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

### 3. Update Firestore Security Rules

Go to Firestore Database > Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Tasks collection
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }

    // Urgency patterns collection
    match /urgencyPatterns/{patternId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }

    // Notifications collection
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }

    // Contextual events collection
    match /contextualEvents/{eventId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### 4. Run the App

#### Start the development server:
```bash
npx expo start
```

#### Run on iOS Simulator:
```bash
npx expo start --ios
```

#### Run on Android Emulator:
```bash
npx expo start --android
```

#### Run on your physical device:
1. Install Expo Go app from App Store or Play Store
2. Scan the QR code shown in the terminal

## Project Structure

```
ADHDapp/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   │   ├── auth/         # Login, Signup screens
│   │   ├── tasks/        # Task-related screens
│   │   ├── wellness/     # Wellness check-in screens
│   │   └── settings/     # Settings screens
│   ├── navigation/       # Navigation configuration
│   ├── services/         # Business logic & API calls
│   │   └── firebase/     # Firebase configuration
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Helper functions
│   ├── constants/        # App constants
│   └── theme/            # Theme configuration
├── functions/            # Firebase Cloud Functions (coming soon)
├── assets/               # Images, icons, fonts
├── App.tsx               # Root component
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## Usage

### Creating a Task

1. Sign up or log in to the app
2. On the Tasks screen, tap the **+** button
3. Fill in task details:
   - **Title** (required)
   - **Description** (optional)
   - **Category** (auto-suggested based on keywords)
   - **Urgency** (critical/high/medium/low)
   - **Due Date** (optional)
4. Tap **Save**

### Managing Tasks

- **Complete**: Swipe right or tap the checkbox
- **Edit**: Tap on the task
- **Delete**: Swipe left

### Viewing Tasks

- Filter by category, urgency, or status
- Sort by due date, creation date, or urgency
- View statistics on the dashboard

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Project setup with Expo & TypeScript
- [x] Firebase configuration
- [x] Authentication (Login/Signup)
- [x] Basic task CRUD
- [x] Navigation structure

### Phase 2: Core Features (In Progress)
- [ ] Auto-categorization
- [ ] Task filtering and sorting
- [ ] Due date tracking
- [ ] Task details screen with full editing

### Phase 3: Notifications (Week 5-6)
- [ ] Push notification setup
- [ ] Wellness check-in reminders
- [ ] Task due date reminders
- [ ] Notification settings

### Phase 4: Learning System (Week 7-8)
- [ ] Completion data tracking
- [ ] Pattern analysis (Cloud Functions)
- [ ] Urgency suggestions
- [ ] Learning dashboard

### Phase 5: Contextual Features (Week 9-10)
- [ ] Contextual events (Christmas, etc.)
- [ ] Date proximity triggers
- [ ] Task accumulation alerts
- [ ] Time-based reminders

### Phase 6: Polish (Week 11-12)
- [ ] Offline support optimization
- [ ] Onboarding flow
- [ ] Testing (unit, integration, E2E)
- [ ] Performance optimization

## Troubleshooting

### Firebase initialization error
- Verify your `.env` file has all required Firebase credentials
- Make sure `.env` is not in `.gitignore` during development
- Restart the Expo dev server after changing `.env`

### Authentication errors
- Check Firebase Console > Authentication is enabled for Email/Password
- Verify Firestore security rules are set up correctly

### Tasks not loading
- Ensure user is authenticated
- Check Firestore security rules allow read access
- Verify network connection

### App not running on physical device
- Make sure device and computer are on the same network
- Try restarting the Expo dev server
- Clear Expo Go app cache

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT

## Support

For questions or issues, please check:
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

---

Built with ❤️ for better productivity and ADHD management
