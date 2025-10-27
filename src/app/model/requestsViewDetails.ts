export interface requestsViewDetails {
    requestId: number;
    department: string;
    eventName: string;
    requestStatus: string;
    requestDate: Date | string;
    noOfParticipants: number;
    justification: string;
    requestedBy:String;
}
