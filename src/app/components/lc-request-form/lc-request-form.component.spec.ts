import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LcRequestFormComponent } from './lc-request-form.component';

describe('LcRequestFormComponent', () => {
  let component: LcRequestFormComponent;
  let fixture: ComponentFixture<LcRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LcRequestFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LcRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
