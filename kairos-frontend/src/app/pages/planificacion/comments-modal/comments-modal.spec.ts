import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsModalComponent } from './comments-modal.component';

describe('CommentsModal', () => {
  let component: CommentsModalComponent;
  let fixture: ComponentFixture<CommentsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
