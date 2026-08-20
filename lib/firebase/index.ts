export {
  firebaseApp,
  auth,
  db,
} from "./client";

export {
  initializeAuthPersistence,
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  subscribeToAuth,
} from "./auth";

export {
  getFirebaseAnalytics,
  trackEvent,
} from "./analytics";
