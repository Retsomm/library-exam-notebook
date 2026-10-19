import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '閱日｜初等圖書資訊管理練習',
  description: '考選部官方歷屆題庫、錯題本、收藏與學習筆記。適合手機閱讀的圖書資訊管理練習網站。',
  applicationName: '閱日',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#101617' };
const RootLayout = ({ children }: Readonly<{children: React.ReactNode}>) => (
  <html lang="zh-Hant"><body>{children}</body></html>
);
export default RootLayout;
