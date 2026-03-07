import React, {
  DependencyList,
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseStorage } from 'firebase/storage';

const SUPER_ADMIN_EMAILS = [
  'caio@entouragelab.com',
  'mario@entouragelab.com',
  'marcos.freitas@entouragelab.com',
  'tiago.fonseca@entouragelab.com',
];

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
}

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  isAdmin: boolean;
  isAdminLoading: boolean;
}

export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  isAdmin: boolean;
  isAdminLoading: boolean;
}

export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  isAdmin: boolean;
  isAdminLoading: boolean;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(
  undefined
);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
  storage,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      setUserAuthState({
        user: null,
        isUserLoading: false,
        userError: new Error('Auth service not provided.'),
      });
      return;
    }

    setUserAuthState({ user: null, isUserLoading: true, userError: null });

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (
          firebaseUser &&
          firebaseUser.email &&
          !firebaseUser.email.endsWith('@entouragelab.com')
        ) {
          console.warn(
            `Access denied for ${firebaseUser.email}. Signing out.`
          );
          auth.signOut();
          setUserAuthState({
            user: null,
            isUserLoading: false,
            userError: new Error(
              'Acesso restrito para contas @entouragelab.com. Tente novamente com a conta correta.'
            ),
          });
        } else {
          setUserAuthState({
            user: firebaseUser,
            isUserLoading: false,
            userError: null,
          });
        }
      },
      (error) => {
        console.error(
          'FirebaseProvider: onAuthStateChanged error:',
          error
        );
        setUserAuthState({
          user: null,
          isUserLoading: false,
          userError: error,
        });
      }
    );
    return () => unsubscribe();
  }, [auth]);

  const [isDynamicAdmin, setIsDynamicAdmin] = useState(false);
  const [isDynamicAdminLoading, setIsDynamicAdminLoading] = useState(true);

  const isSuperAdmin = useMemo(() => {
    if (!userAuthState.user?.email) return false;
    return SUPER_ADMIN_EMAILS.includes(userAuthState.user.email);
  }, [userAuthState.user]);

  useEffect(() => {
    if (!firestore || !userAuthState.user?.uid) {
      setIsDynamicAdmin(false);
      setIsDynamicAdminLoading(false);
      return;
    }

    if (isSuperAdmin) {
      setIsDynamicAdmin(false);
      setIsDynamicAdminLoading(false);
      return;
    }

    setIsDynamicAdminLoading(true);
    const adminDocRef = doc(firestore, 'roles_admin', userAuthState.user.uid);

    const unsubscribe = onSnapshot(
      adminDocRef,
      (docSnapshot) => {
        setIsDynamicAdmin(docSnapshot.exists());
        setIsDynamicAdminLoading(false);
      },
      (error) => {
        console.error('Error checking admin status:', error);
        setIsDynamicAdmin(false);
        setIsDynamicAdminLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, userAuthState.user?.uid, isSuperAdmin]);

  const isAdmin = isSuperAdmin || isDynamicAdmin;
  const isAdminLoading = userAuthState.isUserLoading || isDynamicAdminLoading;

  const contextValue = useMemo(
    (): FirebaseContextState => {
      const servicesAvailable = !!(
        firebaseApp &&
        firestore &&
        auth &&
        storage
      );
      return {
        areServicesAvailable: servicesAvailable,
        firebaseApp: servicesAvailable ? firebaseApp : null,
        firestore: servicesAvailable ? firestore : null,
        auth: servicesAvailable ? auth : null,
        storage: servicesAvailable ? storage : null,
        user: userAuthState.user,
        isUserLoading: userAuthState.isUserLoading,
        userError: userAuthState.userError,
        isAdmin,
        isAdminLoading,
      };
    },
    [firebaseApp, firestore, auth, storage, userAuthState, isAdmin, isAdminLoading]
  );

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable) {
    return {
      firebaseApp: null as unknown as FirebaseApp,
      firestore: null as unknown as Firestore,
      auth: null as unknown as Auth,
      storage: null as unknown as FirebaseStorage,
      user: null,
      isUserLoading: true,
      userError: null,
      isAdmin: false,
      isAdminLoading: true,
    };
  }

  return {
    firebaseApp: context.firebaseApp!,
    firestore: context.firestore!,
    auth: context.auth!,
    storage: context.storage!,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
    isAdmin: context.isAdmin,
    isAdminLoading: context.isAdminLoading,
  };
};

export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

export const useStorage = (): FirebaseStorage => {
  const { storage } = useFirebase();
  return storage;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase<T> = T & { __memo?: boolean };

export function useMemoFirebase<T>(
  factory: () => T,
  deps: DependencyList
): T | MemoFirebase<T> {
  const memoized = useMemo(factory, deps);

  if (typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;

  return memoized;
}

export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError, isAdmin, isAdminLoading } =
    useFirebase();
  return { user, isUserLoading, userError, isAdmin, isAdminLoading };
};
