import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LcRequestsListComponent } from './lc-requests-list.component';

describe('LcRequestsListComponent', () => {
  let component: LcRequestsListComponent;
  let fixture: ComponentFixture<LcRequestsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LcRequestsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LcRequestsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
