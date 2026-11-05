# Attendify Student App

Expo React Native student app for secure university attendance check-in.

## Environment

Set these values before building:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.114:3000
EXPO_PUBLIC_SSL_CERT_NAMES=attendify_backend
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

The development fallback server is `http://192.168.0.114:3000`. Certificate pinning only applies to HTTPS builds.

## Certificate Pinning

Pinned certificates are loaded by `react-native-ssl-pinning` from the native bundle using the names in `EXPO_PUBLIC_SSL_CERT_NAMES`.

When the backend certificate renews:

1. Export the server certificate in DER format.
2. Add it to `ios/<app>/` and `android/app/src/main/assets/` using the same base name, for example `attendify_backend.cer`.
3. If you changed the base name, update `EXPO_PUBLIC_SSL_CERT_NAMES`.
4. Rebuild the native app with `expo run:ios` or `expo run:android`.
5. Confirm a request succeeds against the real server and fails against a proxy with a different certificate.

Pinning protects attendance credentials and device identifiers from MITM attacks, hostile Wi-Fi interception, and debugging proxy capture.

## Security Notes

- Device fingerprint headers are sent as `X-Device-Fingerprint`.
- Root or jailbreak detection blocks the app and logs a `jailbreak_detected` security event.
- The challenge screen enables screenshot prevention to reduce classroom-code sharing.
- Offline queue payloads are encrypted with a key derived from the access token and device fingerprint.
- Sentry tags include student year, app version, and platform only. Registration numbers and other PII are not sent.

## Accessibility Verification

Interactive controls include `accessibilityLabel` and `accessibilityRole`. OTP fields include digit-specific labels and hints. Decorative icons are hidden from screen readers. The color palette was selected to meet WCAG AA contrast for primary text and controls on the configured backgrounds.

Manual results to record for release:

- iOS VoiceOver: login, check-in, challenge OTP, tabs, and logout reachable.
- Android TalkBack: login, check-in, challenge OTP, tabs, and logout reachable.

## Lottie Assets

The app expects these open-source Lottie JSON animations in `assets/lottie/`:

- Success green checkmark: https://lottiefiles.com/search?q=success%20check
- Failure red X pulse: https://lottiefiles.com/search?q=error%20x
- Loading spinning dots: https://lottiefiles.com/search?q=loading%20dots
- Warning amber bell shake: https://lottiefiles.com/search?q=warning%20bell

Placeholder JSON files are committed so the app can boot before final animation files are dropped in.

## E2E Tests

```bash
npm run test:e2e -- --configuration ios.sim.debug
npm run test:e2e -- --configuration android.emu.debug
```

Detox suites cover login, login failure, check-in success, check-in rejection, challenge re-verification, and offline queue sync.
