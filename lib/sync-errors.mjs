export const syncErrorMessage=error=>{
 const code=typeof error==='object'&&error&&typeof error.code==='string'?error.code.replace(/^firestore\//,''):'';
 const reasons={
  'permission-denied':'雲端拒絕讀寫，請確認帳號登入狀態及網站的 Firestore 權限設定。',
  'unauthenticated':'登入驗證已失效，請重新登入後同步。',
  'unavailable':'目前無法連上雲端伺服器，請確認網路連線。',
  'resource-exhausted':'雲端服務目前超過使用額度，進度暫時無法同步。',
  'deadline-exceeded':'雲端連線逾時，請稍後重試。',
 };
 return reasons[code]||'雲端讀寫未完成，請保留本機紀錄並重新同步。';
};
