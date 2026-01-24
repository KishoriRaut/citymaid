import { getCurrentUser } from "./session";

export interface DebugReport {
  timestamp: string;
  userAgent: string;
  url: string;
  isAdmin: boolean;
  currentUser: any;
  sessionInfo: {
    cookies: string;
    localStorage: Record<string, any>;
    sessionStorage: Record<string, any>;
  };
  databaseRole?: {
    is_admin: boolean;
    role: string;
    admin_emails: string[];
  };
  errors: string[];
  warnings: string[];
  networkRequests: Array<{
    url: string;
    method: string;
    status: number;
    duration: number;
    success: boolean;
  }>;
}

class DebugReportCollector {
  private report: DebugReport = {
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Server',
    url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
    isAdmin: false,
    currentUser: null,
    sessionInfo: {
      cookies: '',
      localStorage: {},
      sessionStorage: {}
    },
    errors: [],
    warnings: [],
    networkRequests: []
  };

  constructor() {
    this.collectInitialData();
  }

  private collectInitialData() {
    if (typeof window === 'undefined') return;

    // Collect current user info
    const currentUser = getCurrentUser();
    this.report.currentUser = currentUser;
    
    // Check admin status using role
    this.report.isAdmin = currentUser ? currentUser.role === 'admin' : false;

    // Collect session info
    this.report.sessionInfo = {
      cookies: document.cookie,
      localStorage: Object.fromEntries(Object.entries(localStorage)),
      sessionStorage: Object.fromEntries(Object.entries(sessionStorage))
    };
  }

  setDatabaseRole(roleData: any) {
    this.report.databaseRole = roleData;
  }

  addError(message: string) {
    this.report.errors.push(`[${new Date().toISOString()}] ${message}`);
  }

  addWarning(message: string) {
    this.report.warnings.push(`[${new Date().toISOString()}] ${message}`);
  }

  addNetworkRequest(url: string, method: string, status: number, duration: number, success: boolean) {
    this.report.networkRequests.push({
      url,
      method,
      status,
      duration,
      success
    });
  }

  generateReport(): DebugReport {
    return { ...this.report };
  }

  generateHumanReadableReport(): string {
    const report = this.generateReport();
    
    return `
ADMIN BYPASS DEBUG REPORT
=============================

Timestamp: ${report.timestamp}
URL: ${report.url}
User Agent: ${report.userAgent}

USER INFORMATION
------------------
Email: ${report.currentUser?.email || 'Not logged in'}
User ID: ${report.currentUser?.id || 'N/A'}
Is Admin (Email Check): ${report.isAdmin ? 'YES' : 'NO'}

DATABASE ROLE
---------------
Is Admin (Database): ${report.databaseRole?.is_admin ? 'YES' : 'NO'}
Role: ${report.databaseRole?.role || 'Unknown'}
Admin Emails: ${report.databaseRole?.admin_emails?.join(', ') || 'Unknown'}

SESSION INFORMATION
---------------------
Cookies: ${report.sessionInfo.cookies ? 'Present' : 'None'}
Local Storage Keys: ${Object.keys(report.sessionInfo.localStorage).join(', ') || 'None'}
Session Storage Keys: ${Object.keys(report.sessionInfo.sessionStorage).join(', ') || 'None'}

NETWORK REQUESTS
------------------
${report.networkRequests.map(req => 
  `${req.method} ${req.url} - ${req.status} (${req.duration}ms) ${req.success ? 'SUCCESS' : 'FAILED'}`
).join('\n') || 'No network requests captured'}

ERRORS
---------
${report.errors.length > 0 ? report.errors.join('\n') : 'No errors'}

WARNINGS
-----------
${report.warnings.length > 0 ? report.warnings.join('\n') : 'No warnings'}

ANALYSIS
-----------
${this.generateAnalysis()}
    `.trim();
  }

  private generateAnalysis(): string {
    const { isAdmin, currentUser, databaseRole, errors, networkRequests } = this.report;
    
    let analysis = '';
    
    // Check if user is logged in
    if (!currentUser) {
      analysis += 'ERROR: User is not logged in\n';
    } else {
      analysis += 'SUCCESS: User is logged in\n';
    }
    
    // Check admin detection consistency
    if (isAdmin && databaseRole?.is_admin) {
      analysis += 'SUCCESS: Admin status consistent (email + database)\n';
    } else if (isAdmin && !databaseRole?.is_admin) {
      analysis += 'WARNING: Admin mismatch: Email says YES, Database says NO\n';
    } else if (!isAdmin && databaseRole?.is_admin) {
      analysis += 'WARNING: Admin mismatch: Email says NO, Database says YES\n';
    } else {
      analysis += 'SUCCESS: Consistent: Not an admin\n';
    }
    
    // Check for network errors
    const failedRequests = networkRequests.filter(req => !req.success);
    if (failedRequests.length > 0) {
      analysis += `ERROR: ${failedRequests.length} network requests failed\n`;
    }
    
    // Check for errors
    if (errors.length > 0) {
      analysis += `ERROR: ${errors.length} errors occurred\n`;
    }
    
    // Final assessment
    if (isAdmin && currentUser && errors.length === 0) {
      analysis += '\nEXPECTED BEHAVIOR: Admin bypass should work\n';
    } else if (!isAdmin) {
      analysis += '\nEXPECTED BEHAVIOR: Should redirect to payment (normal user)\n';
    } else {
      analysis += '\nISSUE DETECTED: Admin bypass may not work properly\n';
    }
    
    return analysis;
  }

  // Export report to console and alert
  showReport() {
    const report = this.generateHumanReadableReport();
    console.log(report);
    
    // Also show a simplified alert
    const { currentUser, isAdmin, databaseRole } = this.report;
    alert(`DEBUG SUMMARY:\n\nUser: ${currentUser?.email || 'Not logged in'}\nAdmin (Email): ${isAdmin ? 'YES' : 'NO'}\nAdmin (DB): ${databaseRole?.is_admin ? 'YES' : 'NO'}\nErrors: ${this.report.errors.length}\n\nFull report in console (F12)`);
  }
}

// Global debug report instance
let debugReport: DebugReportCollector | null = null;

export function getDebugReport(): DebugReportCollector {
  if (!debugReport) {
    debugReport = new DebugReportCollector();
  }
  return debugReport;
}

export function initDebugReport() {
  debugReport = new DebugReportCollector();
  return debugReport;
}
