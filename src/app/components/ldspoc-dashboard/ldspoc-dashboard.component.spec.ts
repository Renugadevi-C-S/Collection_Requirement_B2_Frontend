import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LdspocDashboardComponent } from './ldspoc-dashboard.component';

describe('LdspocDashboardComponent', () => {
  let component: LdspocDashboardComponent;
  let fixture: ComponentFixture<LdspocDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LdspocDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LdspocDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
