export interface requestsViewDetails {
    requestId: number;
    requestedBy: string;
    department: string;
    eventName: string;
    requestStatus: string;
    requestDate: Date | string;
    noOfParticipants: number;
    justification: string;
}
