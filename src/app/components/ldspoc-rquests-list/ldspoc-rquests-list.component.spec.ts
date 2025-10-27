import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LdspocRquestsListComponent } from './ldspoc-rquests-list.component';

describe('LdspocRquestsListComponent', () => {
  let component: LdspocRquestsListComponent;
  let fixture: ComponentFixture<LdspocRquestsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LdspocRquestsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LdspocRquestsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
