# Elevate - Lightweight To-do App

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

   The app opens at `http://localhost:3000`.

## Android (Capacitor) Notifications

This app is configured to use Capacitor Local Notifications for Android task reminders.

### One-time setup

1. Build and sync native files:
   `npm run build:mobile`
2. Open Android Studio project:
   `npm run cap:open:android`
3. Run the app on an Android device/emulator from Android Studio.

### Notification behaviour

- Reminders are scheduled natively on Android from task due date/time and reminder offset.
- Completing recurring tasks with recurring prompts OFF auto-creates the next occurrence and schedules its reminder.
- Completing recurring tasks with recurring prompts ON waits for your confirmation in the completion modal.

### How to test reminder delivery on Android

1. Install and run the Android app build.
2. Accept notification permission when prompted.
3. Create a task due in 2-3 minutes with reminders enabled and reminder timing set to "At due time".
4. Background the app and lock the screen.
5. Verify the reminder appears at the expected time.

### Notes

- Browser `npm run dev` remains useful for UI development.
- Reliable background reminder delivery requires running the Capacitor Android app build.

