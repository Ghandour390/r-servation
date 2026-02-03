import { Test } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('EventController', () => {
  let controller: EventController;
  let service: EventService;

  const mockEvent = {
    id: '1',
    title: 'Test Event',
    description: 'Test Description',
    dateTime: new Date(),
    location: 'Test Location',
    maxCapacity: 100,
    remainingPlaces: 100,
  };

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    publish: jest.fn(),
  };

  const mockRequest = {
    user: { sub: 'user1', role: 'ADMIN' },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [EventController],
      providers: [{ provide: EventService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EventController>(EventController);
    service = module.get<EventService>(EventService);
  });

  it('should create event', async () => {
    mockService.create.mockResolvedValue(mockEvent);
    const result = await controller.create(mockEvent, mockRequest);
    expect(result).toEqual(mockEvent);
    expect(mockService.create).toHaveBeenCalledWith({ ...mockEvent, managerId: 'user1' });
  });

  it('should find all events', async () => {
    mockService.findAll.mockResolvedValue([mockEvent]);
    const result = await controller.findAll(mockRequest);
    expect(result).toEqual([mockEvent]);
  });

  it('should find event by id', async () => {
    mockService.findById.mockResolvedValue(mockEvent);
    const result = await controller.findById('1', mockRequest);
    expect(result).toEqual(mockEvent);
  });

  it('should update event', async () => {
    mockService.update.mockResolvedValue(mockEvent);
    const result = await controller.update('1', mockEvent, mockRequest);
    expect(result).toEqual(mockEvent);
  });
});