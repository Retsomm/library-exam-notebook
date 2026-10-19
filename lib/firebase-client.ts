'use client';
import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, type Auth } from 'firebase/auth';

let pending: Promise<Auth> | undefined;
const environmentConfig = (): FirebaseOptions => ({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
export const firebaseAuth = (): Promise<Auth> => {
  if (!pending) pending = (async () => {
    let config = environmentConfig();
    if (!config.apiKey || !config.projectId || !config.appId || !config.authDomain) {
      // Hosting supplies the public web config for the actual deployed project.
      const response = await fetch('/__/firebase/init.json', { cache: 'no-store' });
      if (!response.ok) throw Error('firebase/not-configured');
      config = await response.json();
    }
    if (!config.apiKey || !config.projectId || !config.appId || !config.authDomain) throw Error('firebase/not-configured');
    const app = getApps().length ? getApp() : initializeApp(config);
    const auth = getAuth(app);
    auth.languageCode = 'zh-TW';
    return auth;
  })().catch(error => { pending = undefined; throw error; });
  return pending;
};
export const googleLogin = async (auth: Auth) => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return signInWithPopup(auth, provider);
};
export const googleLogout = async () => signOut(await firebaseAuth());
export const authErrorMessage = (error: unknown): string => {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return '登入視窗已關閉，可再次點選 Google 登入。';
  if (code === 'auth/popup-blocked') return '瀏覽器阻擋登入視窗，請允許本站開啟彈出視窗後重試。';
  if (code === 'auth/unauthorized-domain') return '此網址尚未加入 Firebase Authentication 的授權網域，請網站擁有者完成設定。';
  if (code === 'auth/operation-not-allowed') return 'Firebase 專案尚未啟用 Google 登入，請網站擁有者完成設定。';
  if (code === 'auth/network-request-failed') return '網路連線中斷，請確認連線後重新登入。';
  return 'Google 登入未完成，請稍後重試。';
};
