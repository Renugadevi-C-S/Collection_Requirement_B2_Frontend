export interface EventDetails {
  eventName: string;
  description: string;
  duration: number;
  eventType: string;
  fundingSource: string;
  status: string;
  requestIds?: number[];
  createdBy: string;
}
