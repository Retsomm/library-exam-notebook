# 閱日：Next.js＋Firebase 題庫練習網站

本版本使用 Next.js App Router、React、TypeScript、Firebase Authentication Google 登入，並以 `output: 'export'` 輸出靜態網站，部署到 Firebase Hosting。指定專案 ID 為 `library-exam-notebook`。不使用 Vercel、App Hosting、Cloud Functions 或 NextAuth。

## 功能

- 九年度、36 份試卷、1,755 題，含五筆官方更正，官方 PDF 與答案分開存放。
- 深色 RWD：手機單欄、觸控按鈕、底部導覽；題幹／選項預設 20px，可調 18–28px。
- 閱讀題組、圖表、原卷翻頁與放大、依科目／年度／關鍵字練習。
- 批改、錯題本／已掌握、收藏、筆記、進度接續、JSON 備份匯出／合併匯入。
- Google 登入由 Firebase Authentication 處理；新版以 Firebase UID 隔離 Firestore 資料，同步錯題、收藏、筆記、作答紀錄與練習進度。
- 同一 Google 帳號可在電腦／手機同步；首次使用會合併該帳號現有的本機紀錄。訪客資料須自行匯出、登入後匯入。
- 本機待同步佇列保留離線修改，重新連線後重試；同一欄位的衝突以最後成功同步為準，其他欄位獨立合併。每題保留最近 500 次作答，總覽最多 10,000 筆。
- **同步版已發布**：Firestore 規則與 Firebase Hosting 於 2026-10-18 部署成功，正式網址 https://library-exam-notebook.web.app/ 。
- 配置缺失、登入視窗被阻擋、授權網域缺失時有明確提示；訪客入口 `/demo/` 可直接練習。

## Firebase 主控台設定

1. 開啟 https://console.firebase.google.com/project/library-exam-notebook/overview 。確認此為你擁有的 Google Cloud 專案；若尚未加入 Firebase，先在 Firebase 選擇現有 Google Cloud 專案加入。
2. 在「專案設定 → 一般 → 你的應用程式」註冊網頁應用程式。不要重建其他專案。
3. 「Authentication → Sign-in method」啟用 **Google**，選擇支援電子郵件並儲存。
4. 「Authentication → Settings → Authorized domains」核對 `library-exam-notebook.web.app` 與 `library-exam-notebook.firebaseapp.com`。本機測試時另加 `localhost`。
5. 若使用既有 Google OAuth 網頁用戶端，確認已授權重新導向 URI 為 `https://library-exam-notebook.firebaseapp.com/__/auth/handler`。這個版本不再使用 `/api/auth/callback/google`。以 Firebase 主控台 Google provider 顯示的設定為準；Firebase 可能使用同專案自動建立的 OAuth 用戶端。
6. 啟用 Hosting，選擇現有指定專案的 Hosting 網站。實際上線前核對是否有既有網站，避免覆蓋不相關內容。

Firebase Hosting 會從 `/__/firebase/init.json` 提供該部署專案的公開網頁設定，程式使用 npm 安裝的 Firebase 模組化 SDK 讀取它。無須把 Google OAuth Client Secret、服務帳戶金鑰放到程式或靜態檔案。SDK 本身沒有從保留 URL 載入。

## 本機開發

需求 Node.js 20.9 以上，建議 22 或以上。

```bash
npm ci
cp .env.example .env.local
npm run dev
```

若需本機 Google 登入，將 Firebase 主控台網頁應用程式的 `apiKey`、`authDomain`、`projectId`、`appId` 填入 `.env.local` 的四個 `NEXT_PUBLIC_FIREBASE_*` 欄位。這是 Firebase 公開網頁設定，**不是 Google OAuth Client Secret**。部署到 Firebase Hosting 時可不建立 `.env.local`，由 Hosting 自動提供設定。

無登入可開啟 http://localhost:3000/demo/ 。正式帳戶入口是 `/practice/`，尚未登入會在 Firebase 確認狀態後回到登入頁。

## 部署 Firebase Hosting

`.firebaserc` 已指定使用者提供的 `library-exam-notebook`；`firebase.json` 只部署 `out/` 靜態檔，沒有 Functions、萬用 SPA 重寫或 App Hosting。保留 Firebase `/__/auth/` 登入處理網址。

```bash
npm ci
npm run build
npx firebase-tools login
npx firebase-tools projects:list
npx firebase-tools hosting:sites:list --project library-exam-notebook
npx firebase-tools deploy --only firestore:rules,hosting --project library-exam-notebook
```

`projects:list` 與 `hosting:sites:list` 用於確認帳戶與現有網站。正式授權與專案確認後才執行最後一行。若目前環境已具備授權，也可執行 `npm run deploy`，會重新建置並部署 Firestore 規則與 Hosting。

預期預設網域為 `https://library-exam-notebook.web.app`，**此為目標網址，不代表已上線**。若現有專案使用其他 Hosting site ID，以實際部署回傳的網址為準。

已於 2026-10-18 透過 Firebase 官方 CLI 授權並成功部署至 https://library-exam-notebook.web.app/ 。已核實指定專案、Hosting site、網頁應用程式、Google provider 已啟用及授權網域；不需要 ChatGPT Firebase 外掛。Google OAuth 憑證與 CLI 部署授權分開處理。

正式網站 HTTP 與瀏覽器訪客練習驗證通過：批改、收藏、錯題收錄與重新整理後資料保留。使用者已回報 Google 登入成功。同步模型與遠端權限已驗證，兩台實機的完整登入／離線同步操作仍需實測。

## 測試

```bash
npm test
npm run build
node tests/http-check.mjs
npm start
```

`npm start` 只啟動簡易本機靜態伺服器，不模擬 Firebase `/__/firebase/init.json` 或 Authentication；需要登入時使用本機公開 env 設定或 Firebase Hosting。

瀏覽器測試需可下載 Chromium：

```bash
npx playwright install chromium
npm run test:browser
```

正式上線後仍需使用者完成一次真實 Google 登入，再確認登出、重新登入、本機紀錄、手機彈出視窗及原卷下載。登入與 `/practice/` 導覽檢查在瀏覽器執行，**不是伺服器端存取控制**。考選部題庫與靜態資源公開提供；雲端學習資料則由 Firestore Security Rules 保護，只允許已驗證的 Google 使用者存取自己 UID 路徑。規則不允許跨帳號讀寫或任意刪除。

## 資料搬移

舊版 Sites、Vercel／NextAuth、訪客與 Firebase 帳戶的紀錄空間不同。先在原網站「備份與資料」匯出 JSON，再於新的帳戶匯入；收藏會合併，同題採較新的作答，既有筆記優先保留。

## 結構與來源

- `app/`：Next.js 靜態頁面。
- `components/firebase-login.tsx`、`firebase-practice.tsx`：Firebase Google 登入／狀態與帳戶切換。
- `lib/firebase-client.ts`：Firebase SDK 初始化與登入錯誤提示。
- `components/`、`lib/study.mjs`：練習、批改、錯題與備份。
- `data/`：原始題庫與手機文字版；`scripts/prepare-bank.py`：轉換選項／題組。
- `scripts/prepare-static.mjs`：將題庫複製到公開靜態檔。
- `public/`：官方 PDF、圖像與完整題庫 ZIP。
- `firebase.json`、`.firebaserc`：Hosting 設定與指定專案。

考選部考畢試題查詢平臺：https://wwwq.moex.gov.tw/exam/wFrmExamQandASearch.aspx

收錄民國 106、107、108、109、110、111、113、114、115 年初等考試圖書資訊管理類科；112 年官方查詢頁未列該類科。

考選部引用宣示：本網站資料，歡迎朋友連結使用。但引用時，請註明資料來源並請確保資料之完整（包括本項宣示在內），均不得任意增刪。

歷年法規題依當年內容保留，準備新考試時另核對最新法規。國文複選採完全選對判斷，不換算官方部分給分。

## 雲端同步資料設計

- 預設 Firestore Standard Native 資料庫已建立於台灣 `asia-east1`，服務回傳 `freeTier: true`；未升級計費方案。
- `users/{uid}/questions/{questionId}` 保存各題收藏、筆記、作答、錯題及歷史；`users/{uid}/study/session` 保存練習進度。
- 不把所有資料塞入一個文件，避免累積筆記碰到文件大小限制。
- 寫入採交易、去重 ID 與文件版次；重送不重複計次，取消收藏／清除筆記會同步，舊資料匯入不會復活已刪除的欄位。
- 畫面上方顯示連接中、正在同步、雲端已同步、離線等待及重試狀態；看到「雲端已同步」後再切換裝置。
- `firestore.rules` 定義擁有者權限；`tests/sync.test.mjs` 驗證雙裝置合併、取消收藏、離線覆蓋、重送去重、舊資料合併與進度接續。

12 項 Firebase Rules 遠端測試已通過，含自己帳號讀寫允許、跨帳號讀寫與未登入讀取拒絕。9 項題庫／同步模型測試與正式建置通過。已核對正式部署規則及新版頁面。未宣稱兩台實際裝置端到端測試完成；建議在電腦收藏一題、等「雲端已同步」，再以手機同帳號檢查，接著反向取消收藏確認。

## 作答後解析（第一科：國文）

- 國文9個年度共405題均已補齊解題重點與每個選項的說明，資料位於 `data/explanations/{examId}.json`。
- 正確或錯誤作答後皆顯示；只選選項、未確認答案時不顯示。換題重新建立解析狀態，避免殘留上一題內容。
- 題文或官方答案有解讀疑義時明確註記，保留官方計分答案；部分題目附教育部、學科中心或IPCC參考連結。
- 其餘科目1350題尚未編寫，畫面如實標示。後續順序為公民與英文、圖書館學大意、中文圖書分類編目大意。
- 英文解析資料格式支援 `vocabulary`（word、partOfSpeech、meaning、usage），單字尚待英文科編寫時補入。
- `npm test`新增全國文覆蓋、逐選項完整性與答題前後顯示測試。`prebuild`複製解析至公開目錄；解析檔採重新驗證快取。

## 國文白話詳解版（2026-10-18修訂）

405題均新增各自的讀題教學與答案依據，1710個選項加入明確判斷，介面對照完整選項原句。成語另補可用情境與例句，書信用語範例補適用對象與改法，疑義題保留官方答案並解釋差異。寫作偏好記錄於`EXPLANATION_STYLE.md`。正式發布內容以`data/explanations`為準，編輯草稿工具不在建置流程中。

## 解析彈窗與收藏解析

- 作答後只出現「查看解析」按鈕；點擊才載入解析並開啟原生dialog，支援Escape、關閉按鈕及背景鎖定。
- 彈窗內容獨立捲動，底部固定提供收藏解析與下一題。最後一題改為本回合結果。
- 收藏解析與收藏題目分開，從電腦側邊欄或手機底部「收藏解析」進入，可直接閱讀、取消收藏及依收藏清單跳下一則，不增加作答次數。
- `explanationBookmarks`保存題號並顯示該題最新版完整解析，支援舊版備份匯入、新版匯出與合併。
- Firestore每題新增布林欄位`explanationBookmark`，沿用原本Google帳號UID隔離、離線佇列與逐欄位同步；取消收藏以false保留，不會被舊資料復活。

收藏、取消收藏等明確操作會在事件中即時寫入本機，避免點擊後立刻重新整理時遺失；雲端快照仍依既有機制保存。
