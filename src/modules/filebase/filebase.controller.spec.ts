import { Test, TestingModule } from '@nestjs/testing';
import { FilebaseController } from './filebase.controller';
import { FilebaseService } from './filebase.service';

describe('FilebaseController', () => {
  let controller: FilebaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilebaseController],
      providers: [FilebaseService],
    }).compile();

    controller = module.get<FilebaseController>(FilebaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
