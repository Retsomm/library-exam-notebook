'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StudyApp from './study-app';
import {LoadingState} from './study-ui';
import { firebaseAuth, googleLogout } from '@/lib/firebase-client';

const FirebasePractice = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void firebaseAuth().then(auth => {
      if (!active) return;
      unsubscribe = onAuthStateChanged(auth, current => {
        setUser(current);
        if (!current) router.replace('/sign-in/');
      }, () => setError('無法確認登入狀態，請重新登入。'));
    }).catch(() => {
      if (active) router.replace('/sign-in/');
    });
    return () => { active = false; unsubscribe?.(); };
  }, [router]);
  const logout = async () => {
    try { await googleLogout(); setUser(null); router.replace('/sign-in/'); }
    catch { setError('登出未完成，請確認網路連線後重試。'); }
  };
  if (error) return <main className="loading"><p role="alert">{error}</p><Link className="btn" href="/sign-in/">回到登入頁</Link><button className="btn" onClick={() => location.reload()}>重新整理</button></main>;
  if (!user) return <LoadingState message="正在確認 Google 登入狀態…"/>;
  return <StudyApp key={user.uid} uid={user.uid} accountKey={`firebase:${user.uid}`} email={user.email ?? 'Google 帳戶'} signOutAction={logout} />;
};
export default FirebasePractice;
