import { TestBed } from '@angular/core/testing';

import { MancheService } from './manche.service';

describe('MancheService', () => {
  let service: MancheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MancheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
