import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LdspocEditFormComponent } from './ldspoc-edit-form.component';

describe('LdspocEditFormComponent', () => {
  let component: LdspocEditFormComponent;
  let fixture: ComponentFixture<LdspocEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LdspocEditFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LdspocEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
