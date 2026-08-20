import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "./client";

export type UserRole = "customer" | "admin";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export async function createOrSyncUserProfile(params: {
  uid: string;
  displayName: string;
  email: string;
}) {
  const { uid, displayName, email } = params;

  const ref = doc(db, "users", uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    const profile: UserProfile = {
      uid,
      displayName,
      email,
      role: "customer",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, profile);

    return profile;
  }

  await updateDoc(ref, {
    displayName,
    email,
    updatedAt: serverTimestamp(),
  });

  return {
    ...snapshot.data(),
    uid,
  } as UserProfile;
}

export async function getUserProfile(uid: string) {
  const ref = doc(db, "users", uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...snapshot.data(),
    uid,
  } as UserProfile;
}
