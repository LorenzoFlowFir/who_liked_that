import { TestBed } from '@angular/core/testing';

import { LikedSongService } from './liked-song.service';

describe('LikedSongService', () => {
  let service: LikedSongService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LikedSongService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
