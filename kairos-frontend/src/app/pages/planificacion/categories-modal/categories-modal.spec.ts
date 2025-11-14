import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesModal } from './categories-modal.component';

describe('CategoriesModal', () => {
  let component: CategoriesModal;
  let fixture: ComponentFixture<CategoriesModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
