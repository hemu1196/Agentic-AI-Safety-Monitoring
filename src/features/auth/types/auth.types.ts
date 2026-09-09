export type UserRole = 'ADMIN' | 'WORKER';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  avatar: string | null;
  provider: 'credentials' | 'google';
  loginTime: string;
  initials?: string;
  avatarColor?: string;
}

export interface AuthSession {
  authenticated: boolean;
  loginTime: string;
}

export interface UserRecord {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string;
  workerId: string;
  assignedProject?: string;
  assignedZone?: string;
}
