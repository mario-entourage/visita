/**
 * The four user roles in the system.
 *
 * representante – Sales rep: create visits, view own calendar/records
 * gerente       – Manager:   view all reps, search doctors, view all visits
 * analista      – Analyst:   read-only visit data, search doctors, reports
 * admin         – Admin:     full access, can impersonate any role
 */
export type UserRole = 'representante' | 'gerente' | 'analista' | 'admin';

/** What each role is allowed to do */
export interface RolePermissions {
  /** Can create interaction/visit records */
  canCreateVisits: boolean;
  /** Can view all reps (not just self) */
  canViewAllReps: boolean;
  /** Can search/browse all doctors */
  canSearchDoctors: boolean;
  /** Can view all visit data (not just own) */
  canViewAllVisits: boolean;
  /** Can build/export reports */
  canBuildReports: boolean;
  /** Can manage users, roles, settings */
  canManageSystem: boolean;
  /** Can impersonate other roles */
  canImpersonate: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  representante: {
    canCreateVisits: true,
    canViewAllReps: false,
    canSearchDoctors: true,
    canViewAllVisits: false,
    canBuildReports: false,
    canManageSystem: false,
    canImpersonate: false,
  },
  gerente: {
    canCreateVisits: false,
    canViewAllReps: true,
    canSearchDoctors: true,
    canViewAllVisits: true,
    canBuildReports: false,
    canManageSystem: false,
    canImpersonate: false,
  },
  analista: {
    canCreateVisits: false,
    canViewAllReps: true,
    canSearchDoctors: true,
    canViewAllVisits: true,
    canBuildReports: true,
    canManageSystem: false,
    canImpersonate: false,
  },
  admin: {
    canCreateVisits: true,
    canViewAllReps: true,
    canSearchDoctors: true,
    canViewAllVisits: true,
    canBuildReports: true,
    canManageSystem: true,
    canImpersonate: true,
  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  representante: 'Representante',
  gerente: 'Gerente',
  analista: 'Analista',
  admin: 'Administração',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  representante: '#3b82f6', // blue
  gerente: '#f59e0b',       // amber
  analista: '#8b5cf6',      // purple
  admin: '#ef4444',         // red
};

export function getPermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}
