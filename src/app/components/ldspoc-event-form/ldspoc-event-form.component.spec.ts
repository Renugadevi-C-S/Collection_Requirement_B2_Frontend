import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LdspocEventFormComponent } from './ldspoc-event-form.component';

describe('LdspocEventFormComponent', () => {
  let component: LdspocEventFormComponent;
  let fixture: ComponentFixture<LdspocEventFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LdspocEventFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LdspocEventFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
