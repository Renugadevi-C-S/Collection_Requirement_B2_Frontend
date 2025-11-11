import { Injectable } from '@angular/core';
import { NewApprovalDetails } from '../model/newApprovalDetails';
import { Observable } from 'rxjs';
import { ApprovalSummitResponse } from '../model/approvalSummitResponse';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
  

export class ApprovalService {

  approvalURL: string = 'http://localhost:8080/api/approvals';

  constructor(private http: HttpClient) { }

  submitApproval(approvalDetails: NewApprovalDetails): Observable<ApprovalSummitResponse> {
    console.log('Submitting approval with details:', approvalDetails);
    return this.http.post<ApprovalSummitResponse>(`${this.approvalURL}/submit-approval`, approvalDetails);
  }

}