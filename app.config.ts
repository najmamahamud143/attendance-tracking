import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'attendify-app-new',
  slug: 'attendify-app-new',
  version: '2.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'attendifyappnew',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    ...config.ios,
    supportsTablet: true,
    bundleIdentifier: process.env.EXPO_PUBLIC_IOS_BUNDLE_ID ?? 'com.attendify.student',
  },
  android: {
    ...config.android,
    package: process.env.EXPO_PUBLIC_ANDROID_PACKAGE ?? 'com.najmalovegojo.attendifyappnew',
    permissions: ['android.permission.USE_BIOMETRIC', 'android.permission.USE_FINGERPRINT'],
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-notifications',
    'expo-sqlite',
    [
      'expo-local-authentication',
      {
        faceIDPermission: 'Allow Attendify to use Face ID for attendance verification.',
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic: process.env.EXPO_PUBLIC_API_BASE_URL?.startsWith('http://') ?? true,
        },
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    ...config.extra,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://192.168.0.114:3000',
    sslCertNames: process.env.EXPO_PUBLIC_SSL_CERT_NAMES ?? 'attendify_backend',
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  },
});
