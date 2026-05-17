import { initializeApp } from "firebase/app";

import {
  getFirestore,
} from "firebase/firestore";

import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC6epISJNUhrdc4B6mWagxq-ywl2aJksiw",
  authDomain: "lemburan-admin-3a885.firebaseapp.com",
  projectId: "lemburan-admin-3a885",
  storageBucket: "lemburan-admin-3a885.firebasestorage.app",
  messagingSenderId: "376664701105",
  appId: "1:376664701105:web:d528079bff395964cdca90"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

export const provider =
  new GoogleAuthProvider();