import type {NextConfig} from 'next';
const config:NextConfig={serverExternalPackages:['postgres'],experimental:{serverActions:{bodySizeLimit:'9mb'}}};
export default config;
