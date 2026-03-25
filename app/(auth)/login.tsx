import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import { useAuth, useUser } from '@/firebase/provider';
import { useFonts, ProtestStrike_400Regular } from '@expo-google-fonts/protest-strike';
import Svg, { Path, G, ClipPath, Rect, Defs } from 'react-native-svg';

// Only import expo-auth-session on native
let Google: typeof import('expo-auth-session/providers/google') | null = null;
let WebBrowser: typeof import('expo-web-browser') | null = null;

if (Platform.OS !== 'web') {
  Google = require('expo-auth-session/providers/google');
  WebBrowser = require('expo-web-browser');
  WebBrowser?.maybeCompleteAuthSession();
}

// ---------- Native login hook (expo-auth-session) ----------
function useNativeGoogleAuth() {
  if (!Google) {
    return { request: null, response: null, promptAsync: async () => {} };
  }

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    // androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  return { request, response, promptAsync };
}

// ---------- Component ----------
export default function LoginScreen() {
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [fontsLoaded] = useFonts({ ProtestStrike_400Regular });

  // Native-only Google auth hook
  const { request, response, promptAsync } = useNativeGoogleAuth();

  // Handle native OAuth response
  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (response?.type !== 'success') return;

    const { id_token } = response.params;
    if (!id_token) {
      Alert.alert('Erro', 'Não foi possível obter o token de autenticação.');
      return;
    }

    const signIn = async () => {
      setIsSigningIn(true);
      try {
        const credential = GoogleAuthProvider.credential(id_token);
        await signInWithCredential(auth, credential);
      } catch (err: any) {
        console.error('Firebase sign-in error:', err);
        Alert.alert(
          'Erro de Login',
          err.message || 'Não foi possível fazer login. Tente novamente.'
        );
      } finally {
        setIsSigningIn(false);
      }
    };

    signIn();
  }, [response]);

  // If user is already signed in, redirect to app
  useEffect(() => {
    if (user) {
      router.replace('/(app)/(tabs)');
    }
  }, [user]);

  const handleLogin = async () => {
    setIsSigningIn(true);
    try {
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ hd: 'entouragelab.com' });
        await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      } else {
        if (!request) {
          Alert.alert(
            'Erro',
            'Google Sign-In não está disponível. Verifique a configuração do OAuth Client ID.'
          );
          setIsSigningIn(false);
          return;
        }
        await promptAsync();
        return;
      }
    } catch (err: any) {
      console.error('Login error:', err);
      Alert.alert(
        'Erro de Login',
        err.message || 'Não foi possível fazer login. Tente novamente.'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/entourage-logo-white.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { fontFamily: fontsLoaded ? 'ProtestStrike_400Regular' : 'Protest Strike' }]}>
          VISITAS
        </Text>
      </View>

      <Pressable
        style={[styles.button, isSigningIn && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isSigningIn}
      >
        {!isSigningIn && (
          <Svg width={18} height={18} viewBox="0 0 48 48" style={styles.buttonIcon}>
            <Defs>
              <ClipPath id="g">
                <Path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
              </ClipPath>
            </Defs>
            <G clipPath="url(#g)">
              <Path d="M0 37V11l17 13z" fill="#FBBC05" />
              <Path d="M0 11l17 13 7-6.1L48 14V0H0z" fill="#EA4335" />
              <Path d="M0 37l30-23 7.9 1L48 0v48H0z" fill="#34A853" />
              <Path d="M48 48L17 24l-4-3 35-10z" fill="#4285F4" />
            </G>
          </Svg>
        )}
        <Text style={styles.buttonText}>
          {isSigningIn ? 'Entrando...' : 'Entrar com Google'}
        </Text>
      </Pressable>

      <Text style={styles.restriction}>
        Acesso restrito para contas @entouragelab.com
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0d6e6e',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 200,
    height: 46,
    marginBottom: 20,
  },
  title: {
    fontSize: 72,
    color: '#ffffff',
    letterSpacing: 4,
  },
  button: {
    backgroundColor: '#14b8a6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  restriction: {
    marginTop: 16,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
});
