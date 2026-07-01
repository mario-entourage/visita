import React, {
  DependencyList,
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseStorage } from 'firebase/storage';
import {
  UserRole,
  RolePermissions,
  ROLE_PERMISSIONS,
  getPermissions,
} from '@/types/roles';
import { ensureRepProfile } from '@/services/reps.service';

// ---------------------------------------------------------------------------
// Static super-admin list (always gets 'admin' role)
// ---------------------------------------------------------------------------
const SUPER_ADMIN_EMAILS = [
  'caio@entouragelab.com',
  'mario@entouragelab.com',
  'marcos.freitas@entouragelab.com',
  'tiago.fonseca@entouragelab.com',
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
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
  // Role system
  role: UserRole;
  /** The role currently being used (may differ from `role` during impersonation) */
  effectiveRole: UserRole;
  roleLoading: boolean;
  permissions: RolePermissions;
  /** True when the admin is impersonating another role */
  isImpersonating: boolean;
  /** Switch to impersonate a role (admin only). Pass null to stop. */
  impersonate: (role: UserRole | null) => void;
  // Backwards-compat
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
  role: UserRole;
  effectiveRole: UserRole;
  roleLoading: boolean;
  permissions: RolePermissions;
  isImpersonating: boolean;
  impersonate: (role: UserRole | null) => void;
  isAdmin: boolean;
  isAdminLoading: boolean;
}

export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  role: UserRole;
  effectiveRole: UserRole;
  roleLoading: boolean;
  permissions: RolePermissions;
  isImpersonating: boolean;
  impersonate: (role: UserRole | null) => void;
  isAdmin: boolean;
  isAdminLoading: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
export const FirebaseContext = createContext<FirebaseContextState | undefined>(
  undefined
);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
  storage,
}) => {
  // -- Raw Firebase auth state (no access gating yet) --
  const [rawAuthState, setRawAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      setRawAuthState({
        user: null,
        isUserLoading: false,
        userError: new Error('Auth service not provided.'),
      });
      return;
    }

    setRawAuthState({ user: null, isUserLoading: true, userError: null });

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setRawAuthState({
          user: firebaseUser,
          isUserLoading: false,
          userError: null,
        });
      },
      (error) => {
        console.error('FirebaseProvider: onAuthStateChanged error:', error);
        setRawAuthState({
          user: null,
          isUserLoading: false,
          userError: error,
        });
      }
    );
    return () => unsubscribe();
  }, [auth]);

  // -- Access gate: @entouragelab.com accounts always pass; anyone else must
  // -- be an active entry in allowed_users/{email} (admin-approved external
  // -- rep — one-month-contract reps and marketplace sellers without a
  // -- Workspace account). See isMember() in firestore.rules.
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    if (rawAuthState.isUserLoading) {
      setUserAuthState({ user: null, isUserLoading: true, userError: null });
      return;
    }

    const firebaseUser = rawAuthState.user;
    if (!firebaseUser) {
      setUserAuthState({
        user: null,
        isUserLoading: false,
        userError: rawAuthState.userError,
      });
      return;
    }

    const email = firebaseUser.email;
    const isEntourage = !!email && email.endsWith('@entouragelab.com');
    if (isEntourage) {
      setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      return;
    }

    if (!email || !auth || !firestore) {
      // Need an email + Firestore to check the allowlist; without one, deny.
      auth?.signOut();
      setUserAuthState({
        user: null,
        isUserLoading: false,
        userError: new Error('Não foi possível verificar seu acesso. Tente novamente.'),
      });
      return;
    }

    setUserAuthState((prev) => ({ ...prev, isUserLoading: true }));
    const allowedRef = doc(firestore, 'allowed_users', email.toLowerCase());
    const unsubscribe = onSnapshot(
      allowedRef,
      (snap) => {
        if (snap.exists() && snap.data()?.active === true) {
          setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
        } else {
          console.warn(`Access denied for ${email}: not on the allowlist. Signing out.`);
          auth.signOut();
          setUserAuthState({
            user: null,
            isUserLoading: false,
            userError: new Error(
              'Acesso ainda não liberado para esta conta. Peça para um administrador te adicionar no Visitas.'
            ),
          });
        }
      },
      (error) => {
        console.error('Error checking allowlist:', error);
        auth.signOut();
        setUserAuthState({
          user: null,
          isUserLoading: false,
          userError: new Error('Não foi possível verificar seu acesso. Tente novamente.'),
        });
      }
    );
    return () => unsubscribe();
  }, [rawAuthState, auth, firestore]);

  // -- Self-provision representantes/{uid} on first login (admin no longer
  // -- has to create it manually — it just didn't exist before this).
  const provisionedUidRef = useRef<string | null>(null);
  useEffect(() => {
    if (!firestore || !userAuthState.user) return;
    const { uid, displayName, email } = userAuthState.user;
    if (provisionedUidRef.current === uid) return;
    provisionedUidRef.current = uid;
    ensureRepProfile(firestore, uid, displayName || email || 'Usuário', email).catch(
      (err) => console.error('Error provisioning rep profile:', err)
    );
  }, [firestore, userAuthState.user]);

  // -- Determine real role --
  // 1) Super-admin emails → 'admin'
  // 2) Document at roles/{userId} with field `role` → that role
  // 3) Document at roles_admin/{userId} exists → 'admin' (legacy compat)
  // 4) Default → 'representante'

  const isSuperAdmin = useMemo(() => {
    if (!userAuthState.user?.email) return false;
    return SUPER_ADMIN_EMAILS.includes(userAuthState.user.email);
  }, [userAuthState.user]);

  const [firestoreRole, setFirestoreRole] = useState<UserRole | null>(null);
  const [roleDocLoading, setRoleDocLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !userAuthState.user?.uid) {
      setFirestoreRole(null);
      setRoleDocLoading(false);
      return;
    }

    if (isSuperAdmin) {
      // No need to check Firestore for super-admins
      setFirestoreRole(null);
      setRoleDocLoading(false);
      return;
    }

    setRoleDocLoading(true);

    // Listen to roles/{userId} for the role field
    const roleDocRef = doc(firestore, 'roles', userAuthState.user.uid);
    const unsub1 = onSnapshot(
      roleDocRef,
      (snap) => {
        if (snap.exists() && snap.data()?.role) {
          setFirestoreRole(snap.data().role as UserRole);
        } else {
          setFirestoreRole(null);
        }
        setRoleDocLoading(false);
      },
      (error) => {
        console.error('Error checking role doc:', error);
        // Fallback: check legacy roles_admin collection
        const adminDocRef = doc(
          firestore,
          'roles_admin',
          userAuthState.user!.uid
        );
        const unsub2 = onSnapshot(
          adminDocRef,
          (adminSnap) => {
            if (adminSnap.exists()) {
              setFirestoreRole('admin');
            } else {
              setFirestoreRole(null);
            }
            setRoleDocLoading(false);
          },
          () => {
            setFirestoreRole(null);
            setRoleDocLoading(false);
          }
        );
        return unsub2;
      }
    );

    return () => unsub1();
  }, [firestore, userAuthState.user?.uid, isSuperAdmin]);

  // Final resolved role
  const realRole: UserRole = isSuperAdmin
    ? 'admin'
    : firestoreRole ?? 'representante';
  const roleLoading = userAuthState.isUserLoading || roleDocLoading;

  // -- Impersonation (admin only) --
  const [impersonatedRole, setImpersonatedRole] = useState<UserRole | null>(
    null
  );

  const impersonate = useCallback(
    (role: UserRole | null) => {
      if (realRole !== 'admin') {
        console.warn('Only admins can impersonate roles');
        return;
      }
      setImpersonatedRole(role);
    },
    [realRole]
  );

  const effectiveRole = impersonatedRole ?? realRole;
  const isImpersonating = impersonatedRole !== null;
  const permissions = getPermissions(effectiveRole);

  // Backwards-compat
  const isAdmin = realRole === 'admin';
  const isAdminLoading = roleLoading;

  // -- Context value --
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
        role: realRole,
        effectiveRole,
        roleLoading,
        permissions,
        isImpersonating,
        impersonate,
        isAdmin,
        isAdminLoading,
      };
    },
    [
      firebaseApp,
      firestore,
      auth,
      storage,
      userAuthState,
      realRole,
      effectiveRole,
      roleLoading,
      permissions,
      isImpersonating,
      impersonate,
      isAdmin,
      isAdminLoading,
    ]
  );

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
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
      role: 'representante',
      effectiveRole: 'representante',
      roleLoading: true,
      permissions: ROLE_PERMISSIONS.representante,
      isImpersonating: false,
      impersonate: () => {},
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
    role: context.role,
    effectiveRole: context.effectiveRole,
    roleLoading: context.roleLoading,
    permissions: context.permissions,
    isImpersonating: context.isImpersonating,
    impersonate: context.impersonate,
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
  const {
    user,
    isUserLoading,
    userError,
    role,
    effectiveRole,
    roleLoading,
    permissions,
    isImpersonating,
    impersonate,
    isAdmin,
    isAdminLoading,
  } = useFirebase();
  return {
    user,
    isUserLoading,
    userError,
    role,
    effectiveRole,
    roleLoading,
    permissions,
    isImpersonating,
    impersonate,
    isAdmin,
    isAdminLoading,
  };
};
