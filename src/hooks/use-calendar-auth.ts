import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  GoogleAuthProvider,
  signInWithPopup,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

let Google: typeof import('expo-auth-session/providers/google') | null = null;
let WebBrowser: typeof import('expo-web-browser') | null = null;

if (Platform.OS !== 'web') {
  Google = require('expo-auth-session/providers/google');
  WebBrowser = require('expo-web-browser');
  WebBrowser?.maybeCompleteAuthSession();
}

// Calendar scopes: calendar (read-only) + calendar.events (read/write)
const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

interface CalendarAuthState {
  accessToken: string | null;
  expiresAt: number | null;
}

/**
 * Hook for on-demand Google Calendar OAuth.
 * Does NOT change the login flow — requests calendar scope separately.
 */
export function useCalendarAuth() {
  const auth = useAuth();
  const [state, setState] = useState<CalendarAuthState>({
    accessToken: null,
    expiresAt: null,
  });

  const isAuthorized =
    state.accessToken !== null &&
    state.expiresAt !== null &&
    Date.now() < state.expiresAt;

  const requestAccessWeb = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    CALENDAR_SCOPES.forEach((scope) => provider.addScope(scope));
    provider.setCustomParameters({ hd: 'entouragelab.com' });

    const result = await signInWithPopup(
      auth,
      provider,
      browserPopupRedirectResolver
    );

    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    if (!accessToken) {
      throw new Error('Não foi possível obter o token do Google Calendar.');
    }

    setState({
      accessToken,
      expiresAt: Date.now() + 55 * 60 * 1000, // ~55 min (buffer before 1hr expiry)
    });

    return accessToken;
  }, [auth]);

  const requestAccessNative = useCallback(async () => {
    if (!Google) {
      throw new Error('expo-auth-session não disponível.');
    }

    // On native, we need to make a direct auth request with calendar scope.
    // Since useAuthRequest is a hook and we can't call it conditionally,
    // we use AuthSession directly.
    const { makeRedirectUri } = require('expo-auth-session');
    const { startAsync } = require('expo-auth-session');

    const redirectUri = makeRedirectUri({ useProxy: false });
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

    if (!clientId) {
      throw new Error('iOS Client ID não configurado.');
    }

    const scopes = ['openid', 'email', 'profile', ...CALENDAR_SCOPES];
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent(scopes.join(' '))}` +
      `&hd=entouragelab.com`;

    const result = await WebBrowser?.openAuthSessionAsync(authUrl, redirectUri);

    if (result?.type !== 'success' || !result.url) {
      throw new Error('Autenticação cancelada.');
    }

    // Extract access_token from URL hash fragment
    const params = new URLSearchParams(result.url.split('#')[1]);
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');

    if (!accessToken) {
      throw new Error('Não foi possível obter o token do Google Calendar.');
    }

    const expiresAt = Date.now() + (Number(expiresIn) - 300) * 1000;

    setState({ accessToken, expiresAt });
    return accessToken;
  }, []);

  const requestAccess = useCallback(async (): Promise<string> => {
    // If we already have a valid token, return it
    if (isAuthorized && state.accessToken) {
      return state.accessToken;
    }

    if (Platform.OS === 'web') {
      return requestAccessWeb();
    }
    return requestAccessNative();
  }, [isAuthorized, state.accessToken, requestAccessWeb, requestAccessNative]);

  return {
    accessToken: isAuthorized ? state.accessToken : null,
    isAuthorized,
    requestAccess,
  };
}
