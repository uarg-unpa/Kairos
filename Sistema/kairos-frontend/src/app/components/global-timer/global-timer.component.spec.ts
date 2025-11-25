import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalTimerComponent } from './global-timer.component';

describe('GlobalTimerComponent', () => {
  let component: GlobalTimerComponent;
  let fixture: ComponentFixture<GlobalTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalTimerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
