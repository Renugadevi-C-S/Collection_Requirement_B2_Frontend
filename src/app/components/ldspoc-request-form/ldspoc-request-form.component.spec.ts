import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LdspocRequestFormComponent } from './ldspoc-request-form.component';

describe('LdspocRequestFormComponent', () => {
  let component: LdspocRequestFormComponent;
  let fixture: ComponentFixture<LdspocRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LdspocRequestFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LdspocRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
