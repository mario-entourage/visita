import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  GoogleAuthProvider,
  signInWithPopup,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import { useAuth, useUser } from '@/firebase/provider';
import { useFonts, ProtestStrike_400Regular } from '@expo-google-fonts/protest-strike';
import Svg, { Path } from 'react-native-svg';

/** Official Google G mark — 4 colored segments */
function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M23.745 12.27c0-.79-.07-1.54-.19-2.27H12.255v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <Path
        fill="#34A853"
        d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H3.545v3.09C5.515 21.3 8.745 24 12.255 24z"
      />
      <Path
        fill="#FBBC05"
        d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.545a11.86 11.86 0 000 10.76l3.98-3.09z"
      />
      <Path
        fill="#EA4335"
        d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </Svg>
  );
}

// ---------- Component (web-only Google sign-in) ----------
export default function LoginScreen() {
  const auth = useAuth();
  const { user, userError } = useUser();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [fontsLoaded] = useFonts({ ProtestStrike_400Regular });

  // If user is already signed in, redirect to app
  useEffect(() => {
    if (user) {
      router.replace('/(app)/(tabs)');
    }
  }, [user]);

  const handleLogin = async () => {
    setIsSigningIn(true);
    try {
      // No `hd` (hosted domain) hint — access isn't entouragelab.com-only
      // anymore. External reps sign in with a personal Google account that
      // an admin has approved in Usuários (see allowed_users / isMember()).
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider, browserPopupRedirectResolver);
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
          <View style={{ marginRight: 10 }}>
            <GoogleG size={20} />
          </View>
        )}
        <Text style={styles.buttonText}>
          {isSigningIn ? 'Entrando...' : 'Entrar com Google'}
        </Text>
      </Pressable>

      {userError ? (
        <Text style={styles.error}>{userError.message}</Text>
      ) : null}

      <Text style={styles.restriction}>
        Acesso por convite — contas @entouragelab.com ou liberadas por um administrador
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
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#ffffff',
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
    width: 20,
    height: 20,
    marginRight: 10,
  },
  buttonText: {
    color: '#0d6e6e',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  error: {
    marginTop: 16,
    fontSize: 14,
    color: '#ffd9d9',
    textAlign: 'center',
    maxWidth: 360,
    lineHeight: 20,
  },
  restriction: {
    marginTop: 16,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
});
