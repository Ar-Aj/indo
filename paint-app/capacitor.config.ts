import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.paintviz.app',
  appName: 'PaintViz',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0F0F23'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0F0F23',
      showSpinner: true,
      spinnerColor: '#4F46E5'
    }
  }
};

export default config;