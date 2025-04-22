# P2P File Transfer

A peer-to-peer file transfer application using WebRTC and Firebase for signaling. This application allows users to transfer files directly between browsers without uploading to a server.

## Features

- Create and join rooms with unique IDs
- Direct P2P file transfer using WebRTC DataChannel
- Real-time transfer progress tracking
- Automatic file download on the receiving end
- Clean and responsive UI
- No server-side file storage (files are transferred directly between peers)

## Tech Stack

- HTML5 + CSS3 (Flexbox/Grid)
- Vanilla ES6+ JavaScript modules
- WebRTC DataChannel
- Firebase Realtime Database (for signaling only)
- STUN server: stun.l.google.com:19302

## Project Structure

```
/public
  ├─ index.html      # Single-page UI
  ├─ style.css       # Styling
  └─ main.js         # Firebase + WebRTC logic
firebase.json         # RTDB rules + hosting config
```

## Firebase Data Model

```
rooms
  └─ {roomId}
      └─ signals
          └─ {pushKey}:
              from: "peerA"|"peerB"
              type: "offer"|"answer"|"ice"
              payload: { …SDP or ICE… }
              timestamp: 1234567890
```

## Setup

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Realtime Database in your Firebase project
3. Replace the Firebase configuration in `main.js` with your project's credentials:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       databaseURL: "YOUR_DATABASE_URL",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

## Deployment

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase project:
   ```bash
   firebase init
   ```

4. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

## Usage

1. Open the application in two different browsers or tabs
2. In the first tab:
   - Click "Create Room" to generate a room ID
   - Share the room ID with the other user
3. In the second tab:
   - Enter the room ID
   - Click "Join Room"
4. Once connected:
   - Select a file using the file picker
   - Click "Send" to start the transfer
   - The receiving peer will see the download progress
   - The file will automatically download when complete

## Security Considerations

- The application uses Firebase Realtime Database only for signaling
- Files are transferred directly between peers using WebRTC
- No files are stored on any server
- Room IDs are randomly generated and not easily guessable
- Each peer has a unique ID for signaling

## Browser Support

The application works in modern browsers that support WebRTC:
- Chrome (recommended)
- Firefox
- Edge
- Safari

## Limitations

- File transfer is limited by the peers' network connections
- Large files may take time to transfer depending on network conditions
- Both peers must be online simultaneously for the transfer to work
- Some networks/firewalls may block WebRTC connections

## Contributing

Feel free to submit issues and enhancement requests!

