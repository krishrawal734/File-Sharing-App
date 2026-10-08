import { ConnectionSession, NearbyDevice } from "../../types/device";

export type ConnectionStateListener = (session: ConnectionSession | null) => void;

export class ConnectionService {
  private static instance: ConnectionService;
  private currentSession: ConnectionSession | null = null;
  private listeners: Set<ConnectionStateListener> = new Set();
  private timeoutTimer: any = null;

  private constructor() {}

  public static getInstance(): ConnectionService {
    if (!ConnectionService.instance) {
      ConnectionService.instance = new ConnectionService();
    }
    return ConnectionService.instance;
  }

  public getCurrentSession(): ConnectionSession | null {
    return this.currentSession;
  }

  public addListener(listener: ConnectionStateListener): () => void {
    this.listeners.add(listener);
    listener(this.currentSession);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Initiates a connection request to a discovered nearby device
   */
  public async requestConnection(targetDevice: NearbyDevice): Promise<ConnectionSession> {
    console.log(`[AirDropX:Connection] Request sent to ${targetDevice.name} (${targetDevice.address})`);

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const authToken = `tok_${Math.random().toString(36).substring(2, 10)}`;
    const now = Date.now();
    const TIMEOUT_MS = 30000; // 30 seconds connection request timeout

    let session: ConnectionSession = {
      sessionId,
      authToken,
      targetDevice,
      status: "requesting",
      createdAt: now,
      expiresAt: now + TIMEOUT_MS,
    };

    this.currentSession = session;
    this.notifyListeners();

    // Probe target device HTTP server availability
    if (targetDevice.address && targetDevice.port) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const targetUrl = `http://${targetDevice.address}:${targetDevice.port}/airdropx/info`;
        const res = await fetch(targetUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          console.log(`[AirDropX:Connection] Discovery endpoint reachable for ${targetDevice.name}; this is not authentication`);
          session = {
            ...session,
            status: "connected",
          };
          this.currentSession = session;
          this.notifyListeners();
          return session;
        }
      } catch (err: any) {
        console.log(`[AirDropX:Connection] Probe to ${targetDevice.address} unconfirmed:`, err?.message || err);
      }
    }

    // Start 30-second fallback approval timeout if target offline
    if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
    this.timeoutTimer = setTimeout(() => {
      if (this.currentSession && this.currentSession.sessionId === sessionId && this.currentSession.status === "requesting") {
        console.log("[AirDropX:Connection] Connection request expired");
        this.currentSession = {
          ...this.currentSession,
          status: "expired",
        };
        this.notifyListeners();
      }
    }, TIMEOUT_MS);

    return session;
  }

  /**
   * Accepts incoming or outgoing connection request
   */
  public async acceptConnection(): Promise<void> {
    if (!this.currentSession) return;
    console.log(`[AirDropX:Connection] Request accepted for session ${this.currentSession.sessionId}`);
    console.log(`[AirDropX:Connection] Connected to ${this.currentSession.targetDevice.name}`);

    if (this.timeoutTimer) clearTimeout(this.timeoutTimer);

    this.currentSession = {
      ...this.currentSession,
      status: "connected",
    };
    this.notifyListeners();
  }

  /**
   * Rejects connection request
   */
  public async rejectConnection(): Promise<void> {
    if (!this.currentSession) return;
    console.log(`[AirDropX:Connection] Request rejected for session ${this.currentSession.sessionId}`);

    if (this.timeoutTimer) clearTimeout(this.timeoutTimer);

    this.currentSession = {
      ...this.currentSession,
      status: "rejected",
    };
    this.notifyListeners();
  }

  /**
   * Receives incoming connection request from remote device
   */
  public receiveIncomingRequest(remoteDevice: NearbyDevice, sessionId: string, authToken: string) {
    console.log(`[AirDropX:Connection] Incoming request received from ${remoteDevice.name}`);

    const now = Date.now();
    const session: ConnectionSession = {
      sessionId,
      authToken,
      targetDevice: remoteDevice,
      status: "pending_approval",
      createdAt: now,
      expiresAt: now + 30000,
    };

    this.currentSession = session;
    this.notifyListeners();
  }

  /**
   * Terminate active connection
   */
  public disconnect() {
    if (this.currentSession) {
      console.log(`[AirDropX:Connection] Disconnected from ${this.currentSession.targetDevice.name}`);
    }
    if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
    this.currentSession = null;
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentSession);
      } catch (err) {
        console.log("[AirDropX:Connection] Listener error:", err);
      }
    });
  }
}
