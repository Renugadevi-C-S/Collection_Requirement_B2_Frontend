export interface LCRequest {
  id: number; // simple incremental id for UI-only state
  type: 'ACCESS' | 'CHANGE' | 'OTHER';
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
}
