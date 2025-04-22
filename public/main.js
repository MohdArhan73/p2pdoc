import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, off } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    // TODO: Add your Firebase configuration here
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM elements
const createRoomBtn = document.getElementById('createRoom');
const joinRoomBtn = document.getElementById('joinRoom');
const roomIdInput = document.getElementById('roomId');
const fileInput = document.getElementById('fileInput');
const sendFileBtn = document.getElementById('sendFile');
const senderProgress = document.getElementById('senderProgress');
const receiverProgress = document.getElementById('receiverProgress');
const statusDiv = document.getElementById('status');
const fileTransferDiv = document.querySelector('.file-transfer');

// WebRTC variables
let pc;
let dc;
let roomId;
let isCaller = false;
let myId = Math.random().toString(36).substring(2, 8);
let signalsRef;
let chunks = [];
let expectedSize = 0;

// Initialize WebRTC
function initWebRTC() {
    pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    pc.onicecandidate = e => {
        if (e.candidate) {
            sendSignal("ice", e.candidate);
        }
    };

    pc.ondatachannel = ev => {
        dc = ev.channel;
        setupChannel(dc);
    };
}

// Setup DataChannel
function setupChannel(channel) {
    dc = channel;
    dc.binaryType = "arraybuffer";
    
    dc.onopen = () => {
        updateStatus("Connection established!");
        fileInput.disabled = false;
        sendFileBtn.disabled = false;
    };

    dc.onmessage = ev => receiveChunk(ev.data);
}

// Send signal to Firebase
function sendSignal(type, payload) {
    push(signalsRef, {
        from: myId,
        type,
        payload,
        timestamp: Date.now()
    });
}

// Listen for signals
function listenForSignals() {
    onChildAdded(signalsRef, snap => {
        const { from, type, payload } = snap.val();
        if (from === myId) return;

        if (type === 'offer') {
            pc.setRemoteDescription(payload).then(maybeAnswer);
        } else if (type === 'answer') {
            pc.setRemoteDescription(payload);
        } else if (type === 'ice') {
            pc.addIceCandidate(payload);
        }
    });
}

// Create offer
async function createOffer() {
    dc = pc.createDataChannel("file");
    setupChannel(dc);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal("offer", pc.localDescription);
}

// Answer offer
async function maybeAnswer() {
    if (!isCaller && pc.remoteDescription && !pc.localDescription) {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal("answer", pc.localDescription);
    }
}

// File transfer functions
async function sendFile(file) {
    const size = file.size;
    const chunkSize = 16 * 1024; // 16KB chunks
    
    for (let offset = 0; offset < size; offset += chunkSize) {
        const slice = await file.slice(offset, offset + chunkSize).arrayBuffer();
        dc.send(slice);
        await waitForDrain(dc);
        updateSenderProgress(offset + slice.byteLength, size);
    }
    
    dc.send(JSON.stringify({ done: true }));
}

function waitForDrain(dc) {
    if (dc.bufferedAmount > dc.bufferedAmountLowThreshold) {
        return new Promise(res => dc.onbufferedamountlow = res);
    }
    return Promise.resolve();
}

function receiveChunk(data) {
    if (typeof data === "string") {
        const msg = JSON.parse(data);
        if (msg.done) finishDownload();
    } else {
        chunks.push(data);
        updateReceiverProgress(chunks.length * 16 * 1024, expectedSize);
    }
}

function finishDownload() {
    const blob = new Blob(chunks);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'received_file';
    a.click();
    URL.revokeObjectURL(url);
    chunks = [];
}

// UI update functions
function updateStatus(message) {
    statusDiv.textContent = message;
}

function updateSenderProgress(current, total) {
    const progress = (current / total) * 100;
    senderProgress.value = progress;
}

function updateReceiverProgress(current, total) {
    const progress = (current / total) * 100;
    receiverProgress.value = progress;
}

// Event listeners
createRoomBtn.addEventListener('click', () => {
    roomId = Math.random().toString(36).substring(2, 8);
    roomIdInput.value = roomId;
    joinRoom(roomId);
});

joinRoomBtn.addEventListener('click', () => {
    const id = roomIdInput.value.trim();
    if (id) {
        joinRoom(id);
    }
});

function joinRoom(id) {
    roomId = id;
    isCaller = !roomIdInput.value;
    signalsRef = ref(db, `rooms/${roomId}/signals`);
    
    initWebRTC();
    listenForSignals();
    
    if (isCaller) {
        createOffer();
    }
    
    fileTransferDiv.style.display = 'block';
    updateStatus(`Joined room: ${roomId}`);
}

sendFileBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (file) {
        expectedSize = file.size;
        sendFile(file);
    }
}); 