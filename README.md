# 書庫研習所：Next.js＋Firebase 題庫練習網站

本版本使用 Next.js App Router、React、TypeScript、Firebase Authentication Google 登入，並以 `output: 'export'` 輸出靜態網站，部署到 Firebase Hosting。指定專案 ID 為 `library-exam-notebook`。不使用 Vercel、App Hosting、Cloud Functions 或 NextAuth。

## 功能

- 九年度、36 份試卷、1,755 題，含五筆官方更正，只保留文字題庫、解析與官方來源連結。
- 深色 RWD：手機單欄、觸控按鈕、底部導覽；題幹／選項預設 20px，可調 18–28px。
- 閱讀題組、圖表題官方來源連結、依科目／年度／關鍵字練習。
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

正式上線後仍需使用者完成一次真實 Google 登入，再確認登出、重新登入、本機紀錄、手機彈出視窗及官方來源連結。登入與 `/practice/` 導覽檢查在瀏覽器執行，**不是伺服器端存取控制**。考選部題庫與靜態資源公開提供；雲端學習資料則由 Firestore Security Rules 保護，只允許已驗證的 Google 使用者存取自己 UID 路徑。規則不允許跨帳號讀寫或任意刪除。

## 資料搬移

舊版 Sites、Vercel／NextAuth、訪客與 Firebase 帳戶的紀錄空間不同。先在原網站「備份與資料」匯出 JSON，再於新的帳戶匯入；收藏會合併，同題採較新的作答，既有筆記優先保留。

## 結構與來源

- `app/`：Next.js 靜態頁面。
- `components/firebase-login.tsx`、`firebase-practice.tsx`：Firebase Google 登入／狀態與帳戶切換。
- `lib/firebase-client.ts`：Firebase SDK 初始化與登入錯誤提示。
- `components/`、`lib/study.mjs`：練習、批改、錯題與備份。
- `data/`：原始題庫與手機文字版；`scripts/prepare-bank.py`：轉換選項／題組。
- `scripts/prepare-static.mjs`：將題庫複製到公開靜態檔。
- `public/`：建置時產生的文字題庫與解析 JSON；不包含 PDF、ZIP 或掃描圖像。
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
- 共 1,355 題已有解析：國文 405 題、圖書館學大意 450 題、中文圖書分類編目大意 450 題，以及 115 年公民與英文 50 題。公民與英文其餘 400 題待編寫；畫面依各卷實際覆蓋數標示。
- 英文解析資料格式支援 `vocabulary`（word、partOfSpeech、meaning、usage），單字尚待英文科編寫時補入。
- `npm test`新增全國文覆蓋、逐選項完整性與答題前後顯示測試。`prebuild`複製解析至公開目錄；解析檔採重新驗證快取。

## 國文白話詳解版（2026-10-18修訂）

405題均新增各自的讀題教學與答案依據，1710個選項加入明確判斷，介面對照完整選項原句。成語另補可用情境與例句，書信用語範例補適用對象與改法，疑義題保留官方答案並解釋差異。寫作偏好記錄於`EXPLANATION_STYLE.md`。正式發布內容以`data/explanations`為準，編輯草稿工具不在建置流程中。

## 解析彈窗與收藏解析

- 作答後只出現「查看解析」按鈕；點擊才載入解析並開啟原生dialog，支援Escape、關閉按鈕及背景鎖定。
- 彈窗內容獨立捲動，底部固定提供收藏解析與下一題。最後一題改為本回合結果。
- 收藏解析與收藏題目分開，從電腦側邊欄或手機底部「收藏」→「收藏解析」進入，可直接閱讀、取消收藏及依收藏清單跳下一則，不增加作答次數。
- `explanationBookmarks`保存題號並顯示該題最新版完整解析，支援舊版備份匯入、新版匯出與合併。
- Firestore每題新增布林欄位`explanationBookmark`，沿用原本Google帳號UID隔離、離線佇列與逐欄位同步；取消收藏以false保留，不會被舊資料復活。

收藏、取消收藏等明確操作會在事件中即時寫入本機，避免點擊後立刻重新整理時遺失；雲端快照仍依既有機制保存。

## GitHub 提交規範

儲存庫：https://github.com/Retsomm/library-exam-notebook.git 。每次修改並通過適當檢查後，建立 commit 並推送。詳見 `AGENTS.md`。自 2026-10-19 起不再保存試題附件，只保留考選部來源連結；圖表題需開啟官方原題對照。

## 推送後自動部署 Firebase Hosting

2026-10-19 已設定 GitHub Actions 的加密部署 Secret。專用服務帳戶 `github-action-1424419298` 僅獲授 Hosting 部署、Service Usage Consumer 與 API Keys Viewer 角色。

`.github/workflows/firebase-hosting-merge.yml` 在每次推送 `main` 時，自動安裝依賴、執行 21 項測試、建置 Next.js 靜態網站、檢查 HTTP 路徑，再將 `out/` 發佈至 https://library-exam-notebook.web.app/ 。任何檢查失敗都會停止發佈。也可在 GitHub Actions 手動執行或重新執行此流程。

首次設定需要專案擁有者完成 Firebase 與 GitHub 授權：

```bash
npx firebase-tools@15.34.0 login --no-localhost
npx firebase-tools@15.34.0 init hosting:github --project library-exam-notebook
```

選擇 `Retsomm/library-exam-notebook`。官方初始化會建立部署服務帳戶，並將其金鑰加密儲存為 GitHub Actions secret `FIREBASE_SERVICE_ACCOUNT_LIBRARY_EXAM_NOTEBOOK`。若詢問是否覆寫現有 live workflow，選擇否，以保留目前的測試與建置檢查。不需建立 PR preview workflow；若 CLI 產生預覽流程，使用前先評估是否需要，不要未經確認提交。

本機 Firebase CLI 登入與 GitHub 持續部署的授權彼此獨立。設定完成後，GitHub Actions 不依賴 ChatGPT 工作環境的 CLI 登入狀態。未設定上述 Secret 時流程會明確失敗，不會假裝部署成功。可至 https://github.com/Retsomm/library-exam-notebook/actions 查看每次結果。

這個工作流程只發佈 Hosting 網站，不修改 Authentication、Firestore 資料或權限規則。若變更 `firestore.rules`，仍需測試後另行執行 `firebase deploy --only firestore:rules --project library-exam-notebook`。

## 中文圖書分類編目大意解析

已補齊106、107、108、109、110、111、113、114、115年共450題、1800個選項。每題有白話讀題、答案依據、逐選項辨析及延伸來源；歷史版本、官方一律給分與可疑措辭有個別說明。維持作答後點「查看解析」才開啟彈窗，支援獨立收藏與下一題。

編輯原稿在 `scripts/editorial/cataloging/*.txt`，經 `build.py` 轉成 `data/explanations/*-3.json`；它只整理人工撰寫內容，不根據正解自動生成理由。另記錄106年第15、18、35題圈碼選項的原卷對照修正。建置時依實際解析檔計算各卷完成題數，不再只以科目代號判定完成。

## 題目問題回報

每題練習、題目清單與解析彈窗提供「回報題目問題」。可回報文字辨識、答案／計分、解析或官方來源連結。回報保存當時題幹、四個選項、網站計分答案、使用者作答、原卷 PDF 頁碼、官方標準答案與更正來源，供後續比對；不會只憑回報自動修改答案。

登入者先保存本機，再同步至 `users/{uid}/questionReports/{reportId}`，離線時等待恢復連線或點擊重試。Firestore 僅允許已驗證 Google 帳號讀取本人的回報、建立格式受限的新回報；客戶端不能覆寫、刪除或自行標記已查核。正式查核結果可由具 IAM 權限的管理者填入 `status: resolved`、`resolution`，供使用者查看。訪客只保存在該瀏覽器，需複製或匯出；不會自動送給管理者。回報紀錄獨立匯出，不包含於原本的學習備份。

「題目回報」頁可查看保存／送達狀態、複製給 ChatGPT、匯出紀錄與返回題目。這是查核佇列，並非背景 AI 工作器：回報不會喚醒 ChatGPT。使用者需在對話中要求查核；管理者可使用已授權 Firebase CLI 的憑證執行 `scripts/read-question-reports.cjs --details` 讀取待查核清單。若 CLI 不在專案依賴中，設定 `FIREBASE_TOOLS_LIB` 指向其 `lib` 目錄；不得提交 CLI 憑證。

原卷與標準答案改為直接連到考選部 PDF，不在 Hosting 或 Git 內保存副本。答案按鈕於作答後顯示；回報視窗亦提供原卷、標準答案與已知更正答案來源。官方站可能以瀏覽器開啟或下載 PDF，視瀏覽器設定而定。


## 圖書館學大意解析完成

106、107、108、109、110、111、113、114、115年共450題、1,800個選項已補齊白話解析。每題分讀題重點與答案依據，逐選項提供明確判斷及具體理由，附法規、專業組織、原始研究或官方產品資料等延伸查核連結。歷史法規與服務名稱按年代解讀；官方答案有疑義時保留計分答案並說明爭點。

編輯稿與來源表在 `scripts/editorial/librarianship/`，執行 `python scripts/editorial/librarianship/build.py` 可重建該科9份JSON。另對照106年考選部原卷第1、2頁，修復第2、4、21題的組合數字辨識錯誤，官方答案B、B、A不變。專案只保存文字與原卷連結。

維持作答後預設隱藏解析、按「查看解析」開啟彈窗、收藏解析與下一題操作；本次無資料同步格式或Firestore規則變更。


## 統一答題與解析介面

所有練習入口（總覽、隨機、年度／科目、搜尋、錯題、收藏、紀錄、回報、續答及結果重練）由 `StudyApp` 建立相同 session，僅用 `QuestionPractice` 顯示作答。它不擁有另一套解析內容或彈窗狀態。`StudyApp` 只有一個 `ExplanationDialog` 掛載點，作答與收藏解析共用此彈窗；`AnswerExplanation` 只在彈窗內讀取相同年度JSON。題目、答案與逐選項內容均以原題ID查詢，不在入口另外複製。

`resolveExplanation` 以目前題庫及 session 確認可開啟的題目：未提交、不在目前題號、已進結果頁、已離開對應畫面時不顯示。任何換題、開新回合、離開或結束都清除開啟請求；答對與答錯都必須點「查看解析」。

截圖出現舊側欄與直接展開解析時，應先核對分頁是否仍載入先前部署。建置由 `scripts/build-version.mjs` 對實際程式與資料產生內容版本，`prepare-static.mjs` 輸出 `public/version.json`，Next.js 將同一版本嵌入應用程式。開啟頁面、回到分頁及每分鐘會以 no-store 檢查新版；發現更新只提示，按鈕會先保存當前作答與筆記，保存失敗便不重整。舊分頁第一次仍須重新整理，之後才具備版本偵測程式。登入與訪客共用這個流程，沒有清除任何既有學習資料。

新增回歸檢查涵蓋單一元件掛載、明確開啟、正誤答案、過期開啟請求、收藏下一題、更新偵測、焦點回檢與保存失敗保護；靜態HTTP檢查亦核對版本與原始碼內容雜湊一致。

### 品牌、主畫面圖示與考試倒數

網站採「書庫研習所」主題，以深靛藍、古金、羊皮紙、書卷與羽毛筆呈現見習司書的研習氛圍。品牌資料由 `lib/brand.mjs` 集中提供，頁面共用 `BrandLogo`，圖形唯一來源為 `public/brand/library-mark.svg`。執行 `npm run brand:icons` 產生所有 favicon、180px Apple touch icon、192/512px 圖示及 manifest。

倒數資料由 `lib/exam-countdown.mjs` 集中管理。116 年公務人員初等考試日期為 2027/01/09，報名期間為 2026/10/27–11/05，來源為考選部公告（模組內附連結）。以臺灣日曆日期計算天數，並非距離某一節次的時分秒；考試當天與日期過後顯示相應訊息，下一次考期須依官方新公告更新。

iPhone 使用 Safari 開啟網站，選擇「分享」→「加入主畫面」。舊捷徑可能需要移除後重新加入以更新名稱及圖示。圖示設定不代表離線題庫功能。改名沿用既有本機儲存鍵及雲端路徑，學習資料不需遷移。

## 統一收藏與英文單字卡

主導覽只保留「收藏」，內頁以可用方向鍵、Home、End 操作的分頁切換「收藏題目／收藏解析／收藏單字」。題目、解析仍獨立保存，既有資料及本機儲存鍵不變。解析維持明確點擊才開啟；英文單字旁可收藏或取消收藏。兩處共用 `VocabularyCard`；收藏頁可隱藏／顯示中文與例句、搜尋及返回來源題目，每頁最多20張。

`lib/vocabulary.mjs` 從解析建立單一單字索引，建置時輸出 `public/vocabulary.json`；不另外編寫一份單字內容。識別碼依試卷、單字、詞性及意思產生，共用題組同義單字不會重複收藏；例句修訂或題目排序變動不會讓書籤指向其他單字。

學習備份增加可選的 `vocabularyBookmarks` 字串陣列，舊備份缺少時視為空清單。雲端沿用 `users/{uid}/study/session` 和既有 `sessionJSON` 欄位，升級為含 `studyMetadataVersion:2`、`session`、`vocabularyBookmarks` 的學習中繼資料。只存單字ID及布林狀態，不把單字內容重複寫入Firestore。交易逐單字合併並保留 false 移除記號，更新練習進度不覆蓋單字；離線佇列也逐單字合併。讀取仍接受舊版純session JSON，已遷移帳號亦會補上本機尚未上雲端的字卡。沿用現有本人限定規則，無需變更Firestore規則或重新授權。使用新版前應更新其他仍開著的舊版分頁，避免舊程式以舊格式寫入學習進度。

模型測試涵蓋穩定識別碼、來源、去重、舊備份、即時本機保存、跨裝置逐單字合併、離線移除、移除記號及進度保留；真實雙裝置Google登入同步仍需實機驗證。

## 錄取分數看板與正式配分

學習總覽新增「錄取分數與我的練習看板」，收錄106、107、108、109、110、111、113、114、115年初等考試圖書資訊管理錄取標準。九筆資料皆於2026-10-20逐一下載考選部原始統計核對；`data/admission-cutoffs.json` 保存分數、到考／錄取人數、官方下載與政府開放資料集網址及來源SHA-256。原始ZIP/PDF不提交，112年未開設本類科；116年錄取標準尚未公布。

實際得分唯一來源為 `lib/scoring.mjs`：國文單選35題各2分、複選10題各3分；其他科50題各2分。複選依閱卷規則19-2條，各選項獨立判定，完全正確3分、錯1個1.8分、錯2個0.6分，錯超過2個或空白0分。單選錯答不倒扣，官方替代答案及一律給分另行處理。`grade` 的完全正確布林值只用於錯題本／掌握狀態，不拿來當正式得分。

每題提交後顯示原始配分得分；完整原卷結果為單科得分／100分。隨機、錯題、收藏等節選結果只顯示所得分數／實際總配分，不用答對率或放大換算100分。結果頁可直接重練同一份試卷或前往看板。

看板從原有已同步的逐題最新答案重新估分，不另存可失去一致性的分數副本。各科顯示得分、覆蓋題數、距滿分差距；同年度四科所有題目均有已提交答案，才以四科平均對照該年度錄取標準及85／90／95／100分目標。明示這是可跨回合累積的最新答案估分，並非同一次正式模擬考；達到歷史分數不保證未來錄取。既有備份、Google同步與錯題資料不變。

測試遍歷36份原卷滿分、32種複選組合、未答／部分給分／一律給分、替代答案、避免浮點誤差、節選原始分數及四科完整覆蓋限制。

### 重點整理與收藏入口

`data/study-notes.json` 是四科重點卡的唯一內容來源，含白話規則、對照、例子、易錯提醒、自我回想與編輯挑選的關聯試題 ID。關聯數不是出題頻率，也不代表完整考綱；來源參考沿用關聯題目解析，法規與規範須依考題指定年代及版本辨別。`StudyNotes` 延後載入，提供科目、分類、全文搜尋及分頁；不複製題庫或逐題解析。英文單字庫讀取既有 `vocabulary.json`，使用共用 `VocabularyCard` 與既有收藏／同步方法，保留同詞不同語境。

主導覽合併成「收藏與錯題」，內含錯題本、收藏題目、收藏解析、收藏單字四個頁籤，手機以兩欄呈現。錯題清單仍使用 `QuestionList`，所有重點與單字導入的練習仍共用 `QuestionPractice`，逐題解析仍須主動開啟唯一 `ExplanationDialog`。既有儲存鍵與雲端資料格式不變。
