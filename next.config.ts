import type { NextConfig } from 'next';
import {readFileSync} from 'node:fs';
const {version}=JSON.parse(readFileSync('public/version.json','utf8'));
if(!/^[a-f0-9]{16}$/.test(version))throw Error('Run node scripts/prepare-static.mjs before building');
const config: NextConfig = {
  output: 'export',
  env: {NEXT_PUBLIC_APP_VERSION:version},
  generateBuildId: async()=>version,
  trailingSlash: true,
  poweredByHeader: false,
  images: { unoptimized: true },
};
export default config;
