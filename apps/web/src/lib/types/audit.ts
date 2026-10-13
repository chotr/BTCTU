export interface AuditEvent {
  id: string;
  at: string;
  actorId: string;
  action: string;
  resource: string;
  detail: string;
  outcome: "OK" | "DENIED";
  requestId: string;
}
