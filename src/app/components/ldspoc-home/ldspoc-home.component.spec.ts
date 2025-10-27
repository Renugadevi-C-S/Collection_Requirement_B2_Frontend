import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LdspocHomeComponent } from './ldspoc-home.component';

describe('LdspocHomeComponent', () => {
  let component: LdspocHomeComponent;
  let fixture: ComponentFixture<LdspocHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LdspocHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LdspocHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
