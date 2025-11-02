export interface NewApprovalDetails {
    requestId: number;
    approvedBy: string;
    approvalStatus: 'Approved' | 'Rejected';
    approvalNotes: string;
}