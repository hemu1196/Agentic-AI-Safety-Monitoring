import { User, UserRole, AuthSession, UserRecord } from '../types/auth.types';

// Mock credentials database
const SEED_USERS: UserRecord[] = [
  { id: 'USR-001', name: 'Admin User', username: 'admin', email: 'admin@sitesentinel.com', password: 'Admin@123', role: 'ADMIN' as UserRole, status: 'ACTIVE', lastLogin: '2026-08-30 04:14 PM', workerId: '' },
  { id: 'USR-002', name: 'Ramesh Kumar', workerId: 'WRK-1001', username: 'ramesh', email: 'ramesh@example.com', password: 'Worker@123', role: 'WORKER' as UserRole, status: 'ACTIVE', lastLogin: '2026-08-28 08:42 AM', assignedProject: 'Skyline Tower', assignedZone: 'Zone B' },
  { id: 'USR-003', name: 'Arjun Singh', workerId: 'WRK-1002', username: 'arjun', email: 'arjun@example.com', password: 'Worker@123', role: 'WORKER' as UserRole, status: 'ACTIVE', lastLogin: '2026-08-28 09:15 AM', assignedProject: 'Skyline Tower', assignedZone: 'Zone C' }
];

export const authService = {
  /**
   * Fetch all users from unified storage.
   */
  getUsers(): UserRecord[] {
    const data = localStorage.getItem('siteSentinelUsers');
    if (!data) {
      localStorage.setItem('siteSentinelUsers', JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    return JSON.parse(data);
  },

  /**
   * Save all users.
   */
  saveUsers(users: UserRecord[]): void {
    localStorage.setItem('siteSentinelUsers', JSON.stringify(users));
  },

  /**
   * Performs mock sign-in validation against the unified local storage database.
   */
  async login(usernameOrEmailOrId: string, password: string, rememberMe: boolean, selectedLoginType: 'ADMIN' | 'WORKER'): Promise<User> {
    return new Promise((resolve, reject) => {
      // Simulate API latency
      setTimeout(() => {
        const query = usernameOrEmailOrId.toLowerCase().trim();
        const usersList = this.getUsers();

        // 1. Find user by Username, Email, or Worker ID
        const found = usersList.find(c =>
          c.username.toLowerCase() === query ||
          c.email.toLowerCase() === query ||
          (c.workerId && c.workerId.toLowerCase() === query)
        );

        if (!found) {
          reject(new Error('Invalid username/email/worker ID or password.'));
          return;
        }

        // 2. Verify password
        if (found.password !== password) {
          reject(new Error('Invalid username/email/worker ID or password.'));
          return;
        }

        if (found.status === 'INACTIVE') {
          reject(new Error('Your account has been deactivated. Please contact administrator.'));
          return;
        }

        // 3. Strict login type separation checks
        if (selectedLoginType === 'ADMIN' && found.role !== 'ADMIN') {
          reject(new Error('This account is not authorized for Admin Login. Please select Worker Login.'));
          return;
        }

        if (selectedLoginType === 'WORKER' && found.role !== 'WORKER') {
          reject(new Error('This account is not authorized for Worker Login. Please select Admin Login.'));
          return;
        }

        // Update last login
        const nowStr = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const updatedUsers = usersList.map(u => u.id === found.id ? { ...u, lastLogin: nowStr } : u);
        this.saveUsers(updatedUsers);

        const initials = found.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const avatarColor = found.role === 'ADMIN' ? 'bg-indigo-600' : 'bg-emerald-600';

        const user: any = {
          id: found.id,
          name: found.name,
          username: found.username,
          email: found.email || '',
          workerId: found.workerId || '',
          role: found.role,
          assignedProject: found.assignedProject || '',
          assignedZone: found.assignedZone || '',
          loginTime: new Date().toISOString(),
          avatar: null,
          provider: 'credentials',
          initials,
          avatarColor
        };

        const session: AuthSession = {
          authenticated: true,
          loginTime: user.loginTime
        };

        // Clear all previous sessions to prevent conflict
        localStorage.removeItem('siteSentinelUser');
        localStorage.removeItem('siteSentinelAuth');
        sessionStorage.removeItem('siteSentinelUser');
        sessionStorage.removeItem('siteSentinelAuth');

        // Persistence based on rememberMe
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('siteSentinelUser', JSON.stringify(user));
        storage.setItem('siteSentinelAuth', JSON.stringify(session));

        resolve(user);
      }, 800);
    });
  },

  /**
   * Logs out the user.
   */
  async logout(): Promise<void> {
    localStorage.removeItem('siteSentinelUser');
    localStorage.removeItem('siteSentinelAuth');
    sessionStorage.removeItem('siteSentinelUser');
    sessionStorage.removeItem('siteSentinelAuth');
    return Promise.resolve();
  },

  /**
   * Mock Google accounts authentication.
   */
  async googleLogin(email: string, name: string, selectedLoginType: 'ADMIN' | 'WORKER'): Promise<User> {
    return new Promise((resolve, reject) => {
      // Simulate API latency
      setTimeout(() => {
        const query = email.toLowerCase().trim();
        const usersList = this.getUsers();

        // Check if user already exists in our database
        let found = usersList.find(u => u.email.toLowerCase() === query);

        if (!found) {
          // Auto create user if they select mock google profile (for demo purposes)
          let role: UserRole = 'WORKER';
          let workerId = '';
          let assignedProject = '';
          let assignedZone = '';
          if (email.includes('admin')) {
            role = 'ADMIN';
          } else if (email.includes('ramesh')) {
            role = 'WORKER';
            workerId = 'WRK-1001';
            assignedProject = 'Skyline Tower';
            assignedZone = 'Zone B';
          } else if (email.includes('arjun')) {
            role = 'WORKER';
            workerId = 'WRK-1002';
            assignedProject = 'Skyline Tower';
            assignedZone = 'Zone C';
          } else {
            role = 'WORKER';
            workerId = `WRK-${Math.floor(1000 + Math.random() * 9000)}`;
            assignedProject = 'Skyline Tower';
            assignedZone = 'Zone B';
          }

          const newUser: UserRecord = {
            id: `USR-${Date.now()}`,
            name,
            username: email.split('@')[0],
            email,
            password: 'GoogleUser@123',
            role,
            status: 'ACTIVE',
            lastLogin: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            workerId,
            assignedProject,
            assignedZone
          };
          usersList.push(newUser);
          this.saveUsers(usersList);
          found = newUser;
        }

        const finalFound = found as UserRecord;

        // Strict login type checks
        if (selectedLoginType === 'ADMIN' && finalFound.role !== 'ADMIN') {
          reject(new Error('This account is not authorized for Admin Login. Please select Worker Login.'));
          return;
        }
        if (selectedLoginType === 'WORKER' && finalFound.role !== 'WORKER') {
          reject(new Error('This account is not authorized for Worker Login. Please select Admin Login.'));
          return;
        }

        const initials = finalFound.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const avatarColor = finalFound.role === 'ADMIN' ? 'bg-indigo-600' : 'bg-emerald-600';

        const user: any = {
          id: finalFound.id,
          name: finalFound.name,
          username: finalFound.username,
          email: finalFound.email || '',
          workerId: finalFound.workerId || '',
          role: finalFound.role,
          assignedProject: finalFound.assignedProject || '',
          assignedZone: finalFound.assignedZone || '',
          loginTime: new Date().toISOString(),
          avatar: null,
          provider: 'google',
          initials,
          avatarColor
        };

        const session: AuthSession = {
          authenticated: true,
          loginTime: user.loginTime
        };

        // Clear all previous sessions to prevent conflict
        localStorage.removeItem('siteSentinelUser');
        localStorage.removeItem('siteSentinelAuth');
        sessionStorage.removeItem('siteSentinelUser');
        sessionStorage.removeItem('siteSentinelAuth');

        // Google login sets to localStorage by default
        localStorage.setItem('siteSentinelUser', JSON.stringify(user));
        localStorage.setItem('siteSentinelAuth', JSON.stringify(session));

        resolve(user);
      }, 1000);
    });
  },

  /**
   * Mock sending reset instructions.
   */
  async forgotPassword(emailOrUsername: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const query = emailOrUsername.toLowerCase().trim();
        const list = this.getUsers();
        const found = list.find(u => u.email.toLowerCase() === query || u.username.toLowerCase() === query);
        resolve(!!found || query.includes('@'));
      }, 600);
    });
  },

  /**
   * Mock updating user password.
   */
  async resetPassword(password: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 600);
    });
  },

  /**
   * Checks local storages for active sessions.
   */
  getCurrentUser(): User | null {
    const localUser = localStorage.getItem('siteSentinelUser');
    const sessionUser = sessionStorage.getItem('siteSentinelUser');
    const stored = localUser || sessionUser;
    return stored ? JSON.parse(stored) : null;
  },

  /**
   * Checks if user session exists and is authenticated.
   */
  isAuthenticated(): boolean {
    const localAuth = localStorage.getItem('siteSentinelAuth');
    const sessionAuth = sessionStorage.getItem('siteSentinelAuth');
    const auth = localAuth || sessionAuth;
    if (!auth) return false;
    const parsed: AuthSession = JSON.parse(auth);
    return parsed.authenticated;
  }
};
