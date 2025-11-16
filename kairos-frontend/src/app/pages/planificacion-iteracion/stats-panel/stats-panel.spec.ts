import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsPanel } from './stats-panel.component';

describe('StatsPanel', () => {
  let component: StatsPanel;
  let fixture: ComponentFixture<StatsPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
