export interface SessionLimits {
  maxDurationSeconds: number;
  maxTestSessions: number;
  zeroSpendEnforced: boolean;
}

export class SessionManager {
  private startTimeMs: number | null = null;
  private timeoutTimer: NodeJS.Timeout | null = null;
  private sessionCounter = 0;
  private active = false;

  constructor(private limits: SessionLimits) {}

  public startSession(sessionId: string, onTimeout: () => void): void {
    if (this.sessionCounter >= this.limits.maxTestSessions) {
      throw new Error(
        `Safety Stop: Maximum test sessions (${this.limits.maxTestSessions}) reached to protect $5 API credit. Increase AGENT_MAX_TEST_SESSIONS if authorised.`
      );
    }

    this.sessionCounter++;
    this.startTimeMs = Date.now();
    this.active = true;

    // Set maximum session duration timer (default 90s)
    this.timeoutTimer = setTimeout(() => {
      if (this.active) {
        this.active = false;
        console.warn(`[SessionManager] Session '${sessionId}' reached max limit (${this.limits.maxDurationSeconds}s). Enforcing clean shutdown.`);
        onTimeout();
      }
    }, this.limits.maxDurationSeconds * 1000);
  }

  public endSession(): { elapsedSeconds: number; sessionsRun: number } {
    this.active = false;
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }

    const elapsed = this.startTimeMs ? Math.round((Date.now() - this.startTimeMs) / 1000) : 0;
    this.startTimeMs = null;

    return {
      elapsedSeconds: elapsed,
      sessionsRun: this.sessionCounter,
    };
  }

  public isActive(): boolean {
    return this.active;
  }

  public getSessionCount(): number {
    return this.sessionCounter;
  }
}
