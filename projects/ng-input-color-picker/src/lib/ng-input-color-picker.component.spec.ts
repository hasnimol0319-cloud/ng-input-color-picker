import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgInputColorPickerComponent } from './ng-input-color-picker.component';

describe('NgInputColorPickerComponent', () => {
  let component: NgInputColorPickerComponent;
  let fixture: ComponentFixture<NgInputColorPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgInputColorPickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgInputColorPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
