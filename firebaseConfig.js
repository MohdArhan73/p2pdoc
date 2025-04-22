// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyBnjsrcdS9Vw6Qaz9Bu8fb8AvrnNxMEMl0",
  authDomain: "p2pdoc-b6ae2.firebaseapp.com",
  projectId: "p2pdoc-b6ae2",
  storageBucket: "p2pdoc-b6ae2.firebasestoage.app",
  messagingSenderId: "88584467266",
  appId: "1:88584467266:web:b75063d9795398fb874edb"
};

const app = initializeApp(firebaseConfig);

export default app;
