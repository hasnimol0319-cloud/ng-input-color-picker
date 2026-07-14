import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

import { NgInputColorPickerComponent } from './ng-input-color-picker.component';

describe('NgInputColorPickerComponent', () => {
  let component: NgInputColorPickerComponent;
  let fixture: ComponentFixture<NgInputColorPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgInputColorPickerComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgInputColorPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to white', () => {
    expect(component.currentHex()).toBe('FFFFFF');
  });

  it('should update hsva when writeValue is called with a hex color', () => {
    component.writeValue('#FF0000');
    expect(component.currentHex()).toBe('FF0000');
  });

  it('should reset to white when writeValue is called with an empty value', () => {
    component.writeValue('#00FF00');
    component.writeValue(null);
    expect(component.currentHex()).toBe('FFFFFF');
  });
});
