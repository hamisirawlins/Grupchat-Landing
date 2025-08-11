# Firebase Setup Guide

## Prerequisites

1. A Firebase project (you already have one: `grupchat-prod-3ab64`)
2. Firebase CLI installed (optional, for easier management)

## Configuration Steps

### 1. Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `grupchat-prod-3ab64`
3. Click on the gear icon (⚙️) next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. If you don't have a web app, click "Add app" and select the web icon (</>)
7. Register your app with a nickname (e.g., "GC Web")
8. Copy the configuration object

### 2. Environment Variables

Create a `.env.local` file in the root of your `gc-web` project:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id_here
```

### 3. Enable Authentication

1. In Firebase Console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

### 4. Security Rules (Optional)

If you plan to use Firestore, you'll need to set up security rules. For now, the authentication should work without additional configuration.

## Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. Try creating a new account or signing in with existing credentials

## Troubleshooting

### Common Issues

1. **"Firebase App named '[DEFAULT]' already exists"**
   - This is handled automatically in the code
   - If you see this error, it means Firebase is already initialized

2. **"auth/operation-not-allowed"**
   - Make sure Email/Password authentication is enabled in Firebase Console

3. **"auth/invalid-api-key"**
   - Check that your `NEXT_PUBLIC_FIREBASE_API_KEY` is correct
   - Make sure the API key is from the correct Firebase project

4. **"auth/network-request-failed"**
   - Check your internet connection
   - Make sure Firebase services are accessible

### Getting Help

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Next.js Documentation](https://nextjs.org/docs)

