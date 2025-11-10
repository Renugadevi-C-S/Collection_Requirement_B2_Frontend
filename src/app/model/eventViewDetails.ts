export interface EventViewDetails {
  eventId: number;
  eventName: string;
  description: string;
  duration: number;
  eventType: string;
  fundingSource: string;
  participantsCount: number;
  status: string;
  createdBy: string;
  linkedRequests?: LinkedRequestSummary[];
  createdDate?: string;
  completedBy?: string;
  completionNotes?: string;
  completedDate?: string;
  cancelledBy?: string;
  cancellationNotes?: string;
  cancelledDate?: string;
}

//Interface for linked requests summary
export interface LinkedRequestSummary {
  requestId: number;
  tanNo: string;
  noOfParticipants: number;
  requestDate: string;
  justification: string;
  requestedBy: string;
  department: string;
  requestStatus: string;
  curriculum: string;
  approvedBy: string;
  approvalNotes: string;
}
