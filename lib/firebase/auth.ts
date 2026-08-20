import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";

import { auth } from "./client";

export async function initializeAuthPersistence() {
  await setPersistence(auth, browserLocalPersistence);
}

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  await updateProfile(credential.user, {
    displayName: name,
  });

  return credential.user;
}

export async function loginWithEmail(
  email: string,
  password: string,
) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  return credential.user;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: "select_account",
  });

  const credential = await signInWithPopup(auth, provider);

  return credential.user;
}

export async function logout() {
  await signOut(auth);
}

export function subscribeToAuth(
  callback: (user: User | null) => void,
) {
  return onAuthStateChanged(auth, callback);
}
