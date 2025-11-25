import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskFormModalComponent } from './task-form-modal.component';

describe('TaskFormModal', () => {
  let component: TaskFormModalComponent;
  let fixture: ComponentFixture<TaskFormModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
