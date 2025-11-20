import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesModalComponent } from './categories-modal.component';

describe('CategoriesModal', () => {
  let component: CategoriesModalComponent;
  let fixture: ComponentFixture<CategoriesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
