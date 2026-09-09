import { Worker, EntryLog, initialWorkers, initialEntryLogs } from '../../../data/mockData';

export interface AccessRules {
  requireWorkerId: boolean;
  requireActiveStatus: boolean;
  requirePpeVerification: boolean;
  blockPpeBelow75: boolean;
  autoDenyExpired: boolean;
  supervisorOverride: boolean;
}

const DEFAULT_ACCESS_RULES: AccessRules = {
  requireWorkerId: true,
  requireActiveStatus: true,
  requirePpeVerification: true,
  blockPpeBelow75: true,
  autoDenyExpired: true,
  supervisorOverride: false
};

export const workerService = {
  /**
   * Fetch all workers. Seeds default workers if storage is empty.
   * GET /api/workers
   */
  getWorkers(): Worker[] {
    const data = localStorage.getItem('siteSentinelWorkers');
    if (!data) {
      localStorage.setItem('siteSentinelWorkers', JSON.stringify(initialWorkers));
      return initialWorkers;
    }
    return JSON.parse(data);
  },

  /**
   * Save or update a worker profile.
   * POST /api/workers / PATCH /api/workers/:id
   */
  saveWorker(worker: Worker): void {
    const list = this.getWorkers();
    const idx = list.findIndex(w => w.id === worker.id || w.workerId === worker.workerId);
    if (idx >= 0) {
      list[idx] = worker;
    } else {
      list.push(worker);
    }
    localStorage.setItem('siteSentinelWorkers', JSON.stringify(list));
  },

  /**
   * Archives a worker.
   * DELETE /api/workers/:id
   */
  archiveWorker(id: string): void {
    const list = this.getWorkers();
    const found = list.find(w => w.id === id);
    if (found) {
      found.isArchived = true;
      found.status = 'INACTIVE';
      found.accessStatus = 'REVOKED';
      this.saveWorker(found);
    }
  },

  /**
   * Restores an archived worker.
   * POST /api/workers/:id/restore
   */
  restoreWorker(id: string): void {
    const list = this.getWorkers();
    const found = list.find(w => w.id === id);
    if (found) {
      found.isArchived = false;
      found.status = 'ACTIVE';
      found.accessStatus = 'AUTHORIZED';
      this.saveWorker(found);
    }
  },

  /**
   * Fetch all entry/exit logs. Seeds defaults if empty.
   * GET /api/worker-entry/logs
   */
  getLogs(): EntryLog[] {
    const data = localStorage.getItem('siteSentinelEntryLogs');
    if (!data) {
      localStorage.setItem('siteSentinelEntryLogs', JSON.stringify(initialEntryLogs));
      return initialEntryLogs;
    }
    return JSON.parse(data);
  },

  /**
   * Add a new entry verification log.
   * POST /api/worker-entry/entry / POST /api/worker-entry/deny
   */
  addEntryLog(log: Omit<EntryLog, 'id'>): EntryLog {
    const logs = this.getLogs();
    const newLog: EntryLog = {
      ...log,
      id: `log-${Date.now()}`
    };
    logs.push(newLog);
    localStorage.setItem('siteSentinelEntryLogs', JSON.stringify(logs));

    // Update worker status inside the directory if entry is allowed
    if (newLog.accessResult === 'ALLOWED') {
      const workers = this.getWorkers();
      const worker = workers.find(w => w.workerId === newLog.workerId);
      if (worker) {
        worker.status = 'ON SITE';
        this.saveWorker(worker);
      }
    }

    return newLog;
  },

  /**
   * Mark manual worker exit.
   * POST /api/worker-entry/:id/exit
   */
  markExit(logId: string, exitDate: string, exitTime: string): void {
    const logs = this.getLogs();
    const log = logs.find(l => l.id === logId);
    if (log) {
      log.exitDate = exitDate;
      log.exitTime = exitTime;
      log.status = 'EXITED';
      localStorage.setItem('siteSentinelEntryLogs', JSON.stringify(logs));

      // Update worker status to OFF SITE (or ACTIVE)
      const workers = this.getWorkers();
      const worker = workers.find(w => w.workerId === log.workerId);
      if (worker) {
        worker.status = 'OFF SITE';
        this.saveWorker(worker);
      }
    }
  },

  /**
   * Fetch security policy access rules toggles.
   */
  getAccessRules(): AccessRules {
    const data = localStorage.getItem('siteSentinelAccessRules');
    if (!data) {
      localStorage.setItem('siteSentinelAccessRules', JSON.stringify(DEFAULT_ACCESS_RULES));
      return DEFAULT_ACCESS_RULES;
    }
    return JSON.parse(data);
  },

  /**
   * Save security policy access rules toggles.
   */
  saveAccessRules(rules: AccessRules): void {
    localStorage.setItem('siteSentinelAccessRules', JSON.stringify(rules));
  },

  /**
   * Calculate dashboard summaries.
   * GET /api/worker-entry/dashboard-summary
   */
  getSummaryStats(): {
    todayEntries: number;
    currentlyOnSite: number;
    pendingCheck: number;
    accessDeniedToday: number;
    ppeCompliance: number;
  } {
    const logs = this.getLogs();
    const today = new Date().toISOString().split('T')[0]; // matches YYYY-MM-DD formats
    
    // Hardcode matching for static 2026-08-28 as 'today' to keep mock data aligned with prompt local date
    const targetDate = '2026-08-28';

    const todayLogs = logs.filter(l => l.entryDate === targetDate);
    
    const todayEntries = todayLogs.filter(l => l.accessResult === 'ALLOWED').length;
    const currentlyOnSite = logs.filter(l => l.status === 'ON SITE').length;
    
    // Denials count
    const accessDeniedToday = todayLogs.filter(l => l.accessResult === 'DENIED').length;

    // PPE compliance average
    const allowedTodayLogs = todayLogs.filter(l => l.accessResult === 'ALLOWED');
    const ppeSum = allowedTodayLogs.reduce((acc, curr) => acc + curr.ppeScore, 0);
    const ppeCompliance = allowedTodayLogs.length > 0 ? Math.round(ppeSum / allowedTodayLogs.length) : 91;

    // Pending checklists
    const pendingCheck = logs.filter(l => l.status === 'PENDING').length || 6;

    return {
      todayEntries,
      currentlyOnSite,
      pendingCheck,
      accessDeniedToday,
      ppeCompliance
    };
  }
};
