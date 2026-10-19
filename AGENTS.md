# 專案工作規範

- GitHub 儲存庫：https://github.com/Retsomm/library-exam-notebook.git ，預設分支為 `main`。
- 使用者要求：之後每次完成修改，執行適當檢查後，都必須建立 Git commit 並推送到此儲存庫。不要只保留本機修改；回報分支與 commit。若權限、網路或分支保護阻擋，明確回報尚未推送的狀態，不得聲稱成功。
- 推送前檢查差異與待提交檔案。不要提交密碼、OAuth 用戶端密碼、權杖、服務帳戶金鑰、私有環境變數、node_modules 或建置產物。
- 保留遠端既有歷史及其他人的修改；不要 force push。遠端有新提交時，先整合並重新檢查。
- 網站使用 Next.js、Firebase Hosting、Firebase Authentication（Google）及 Firestore。正式網站為 https://library-exam-notebook.web.app/ ，不要改用 ChatGPT Sites。
- 桌面與手機皆須可操作，維持深色主題及 RWD。
- 題目解析依照 `EXPLANATION_STYLE.md`。解析預設隱藏，使用者點選「查看解析」才開啟彈窗；保留獨立的收藏解析與下一題功能。
- 一般檢查使用 `npm test`；修改應用程式程式碼或設定時另執行 `npm run build`。依變更範圍驗證互動及同步流程。

- 題庫只提交文字、解析與考選部來源連結；不要加入 PDF、試題 ZIP 或整頁掃描圖片。圖表題提供官方原題連結。
