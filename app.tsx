import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import type * as ExpoNotifications from 'expo-notifications';
import React, { useEffect } from 'react';
import { ActivityIndicator, Modal, Platform, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { OfflineBanner } from './src/components/OfflineBanner';
import { useAuth } from './src/hooks/useAuth';
import { useChallenge } from './src/hooks/useChallenge';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { useSyncQueue } from './src/hooks/useSyncQueue';
import { useWebSocket } from './src/hooks/useWebSocket';
import { ChallengeScreen } from './src/screens/ChallengeScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { api } from './src/services/api';
import { subscribeToIntegrityChecks } from './src/services/security';
import { useAttendifyStore } from './src/store';
import { colors } from './src/theme';
import { retryWithBackoff } from './src/utils/retryWithBackoff';

export type RootTabParamList = {
  Home: undefined;
  History: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const Sentry = {
  init: (_options: { dsn?: string; enabled: boolean; tracesSampleRate: number }) => undefined,
  setTags: (_tags: Record<string, string>) => undefined,
  wrap: <TComponent,>(component: TComponent) => component,
};

type NotificationsModule = typeof ExpoNotifications;

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  if (Constants.appOwnership === 'expo') {
    return null;
  }

  return import('expo-notifications');
}

function useNotificationHandler() {
  useEffect(() => {
    let mounted = true;

    getNotificationsModule()
      .then((Notifications) => {
        if (!mounted || !Notifications) {
          return;
        }

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldPlaySound: true,




            
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);
}

function usePushRegistration() {
  const accessToken = useAttendifyStore((state) => state.accessToken);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    async function register() {
      const Notifications = await getNotificationsModule();

      if (!Notifications) {
        return;
      }

      const permissions = await Notifications.getPermissionsAsync();
      const finalStatus =
        permissions.status === 'granted'
          ? permissions.status
          : (await Notifications.requestPermissionsAsync()).status;

      if (finalStatus !== 'granted') {
        return;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      const token = projectId
        ? (await Notifications.getExpoPushTokenAsync({ projectId })).data
        : (await Notifications.getExpoPushTokenAsync()).data;

      await retryWithBackoff(() => api.registerPushToken(token));
    }

    register().catch(() => undefined);
  }, [accessToken]);
}

function AuthenticatedTabs() {
  const unread = useAttendifyStore((state) => state.notifications.filter((item) => !item.read).length);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
            Home: 'home-outline',
            History: 'time-outline',
            Notifications: 'notifications-outline',
            Profile: 'person-outline',
          };

          return <Ionicons accessibilityElementsHidden name={icons[route.name]} color={color} size={size} />;
        },
        tabBarBadge: route.name === 'Notifications' && unread > 0 ? unread : undefined,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function Root() {
  const { initializing, isAuthenticated, student } = useAuth();
  const { challenge } = useChallenge();
  const { isConnected } = useNetworkStatus();
  const { syncNow } = useSyncQueue();
  useWebSocket();
  useNotificationHandler();
  usePushRegistration();

  const isSecurityBlocked = useAttendifyStore((state) => state.isSecurityBlocked);
  const securityMessage = useAttendifyStore((state) => state.securityMessage);

  useEffect(() => subscribeToIntegrityChecks(), []);

  useEffect(() => {
    if (student) {
      Sentry.setTags({
        studentYear: String(student.year),
        appVersion: Application.nativeApplicationVersion ?? '2.0',
        platform: Platform.OS,
      });
    }
  }, [student]);

  useEffect(() => {
    if (isConnected) {
      syncNow();
    }
  }, [isConnected, syncNow]);

  if (initializing) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loading}>Loading Attendify</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
      <OfflineBanner visible={!isConnected} />
      <NavigationContainer>
        {isAuthenticated ? <AuthenticatedTabs /> : <LoginScreen />}
      </NavigationContainer>
      <Modal visible={challenge.active} animationType="slide">
        <ChallengeScreen />
      </Modal>
      <Modal visible={isSecurityBlocked} transparent={false}>
        <SafeAreaView style={styles.blocked}>
          <Text style={styles.blockedText}>{securityMessage}</Text>
        </SafeAreaView>
      </Modal>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    justifyContent: 'center',
  },
  loading: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
  blocked: {
    alignItems: 'center',
    backgroundColor: colors.dangerSurface,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  blockedText: {
    color: colors.danger,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 28,
    textAlign: 'center',
  },
});

export default Sentry.wrap(Root);
