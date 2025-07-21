import { Test, TestingModule } from '@nestjs/testing';
import { FilebaseService } from './filebase.service';

describe('FilebaseService', () => {
  let service: FilebaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilebaseService],
    }).compile();

    service = module.get<FilebaseService>(FilebaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
