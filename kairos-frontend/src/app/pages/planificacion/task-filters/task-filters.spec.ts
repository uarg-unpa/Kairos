import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskFilters } from './task-filters.component';

describe('TaskFilters', () => {
  let component: TaskFilters;
  let fixture: ComponentFixture<TaskFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
