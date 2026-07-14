import { TestBed } from '@angular/core/testing';

import { NgInputColorPickerService } from './ng-input-color-picker.service';

describe('NgInputColorPickerService', () => {
  let service: NgInputColorPickerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgInputColorPickerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
