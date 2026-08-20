import {
  getAnalytics,
  isSupported,
  logEvent,
  type Analytics,
} from "firebase/analytics";

import { firebaseApp } from "./client";

let analyticsInstance: Analytics | null = null;

export async function getFirebaseAnalytics() {
  if (typeof window === "undefined") {
    return null;
  }

  if (analyticsInstance) {
    return analyticsInstance;
  }

  const supported = await isSupported();

  if (!supported) {
    return null;
  }

  analyticsInstance = getAnalytics(firebaseApp);

  return analyticsInstance;
}

export async function trackEvent(
  eventName: string,
  params?: Record<string, unknown>,
) {
  const analytics = await getFirebaseAnalytics();

  if (!analytics) {
    return;
  }

  logEvent(analytics, eventName, params);
}
