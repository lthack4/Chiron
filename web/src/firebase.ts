/// <reference types="vite/client" />
import { initializeApp, type FirebaseApp } from 'firebase/app'
import { Auth, getAuth, GoogleAuthProvider } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import type { FirebaseStorage } from 'firebase/storage'


const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
}

// may be set to false if firebaseConfig is not properly set or need to skip firebase initialization
export const isFirebaseConfigured = true  // <-- Set to true if firebaseConfig is properly set

export const app: FirebaseApp | undefined = initializeApp(firebaseConfig)
export let auth: Auth | undefined = getAuth(app)
export const db: Firestore | undefined = undefined
export const storage: FirebaseStorage | undefined = undefined
export let provider: GoogleAuthProvider | undefined = new GoogleAuthProvider()

// still need to figure out how to make the firebase .env work... resposible for firebase errors