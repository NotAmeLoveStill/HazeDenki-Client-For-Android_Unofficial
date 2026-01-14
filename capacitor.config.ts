import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.hazedenki.mobile',
  appName: 'HazeDenki',
  webDir: 'dist/haze-denki-mobile/browser',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;