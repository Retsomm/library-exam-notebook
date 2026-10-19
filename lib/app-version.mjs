export const newerVersion=(manifest,current)=>{
 const version=manifest?.version;
 return /^[a-f0-9]{16}$/.test(version||'')&&/^[a-f0-9]{16}$/.test(current||'')&&version!==current?version:null;
};
/** Do not reload if persisting the latest study state fails. */
export const saveBeforeReload=(storage,key,study,reload)=>{
 storage.setItem(key,JSON.stringify(study));
 reload();
};
