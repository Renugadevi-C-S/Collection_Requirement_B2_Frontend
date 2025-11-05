import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LdspocRequestsListComponent } from './ldspoc-requests-list.component';

describe('LdspocRequestsListComponent', () => {
  let component: LdspocRequestsListComponent;
  let fixture: ComponentFixture<LdspocRequestsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LdspocRequestsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LdspocRequestsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
