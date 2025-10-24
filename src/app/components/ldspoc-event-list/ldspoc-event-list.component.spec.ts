import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LdspocEventListComponent } from './ldspoc-event-list.component';

describe('LdspocEventListComponent', () => {
  let component: LdspocEventListComponent;
  let fixture: ComponentFixture<LdspocEventListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LdspocEventListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LdspocEventListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
