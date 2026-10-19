import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '閱日｜初等圖書資訊管理練習',
  description: '考選部官方歷屆題庫、錯題本、收藏與學習筆記。適合手機閱讀的圖書資訊管理練習網站。',
  applicationName: '閱日',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      {url:'/brand/sunrise-mark.svg',type:'image/svg+xml',sizes:'any'},
      {url:'/brand/favicon-32.png',type:'image/png',sizes:'32x32'},
      {url:'/brand/favicon-16.png',type:'image/png',sizes:'16x16'},
      {url:'/favicon.ico',sizes:'16x16 32x32 48x48'},
    ],
    apple: [{url:'/brand/apple-touch-icon.png',sizes:'180x180',type:'image/png'}],
  },
  appleWebApp: {capable:true,title:'閱日',statusBarStyle:'default'},
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#101617' };
const RootLayout = ({ children }: Readonly<{children: React.ReactNode}>) => (
  <html lang="zh-Hant" data-app-version={process.env.NEXT_PUBLIC_APP_VERSION}><body>{children}</body></html>
);
export default RootLayout;
