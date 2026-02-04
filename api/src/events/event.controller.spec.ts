import { Test } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

describe('EventController', () => {
  let controller: EventController;
  let service: EventService;

  const mockRequest = {
    user: {
      id: 'user-1',
      email: 'test@test.com',
      role: 'ADMIN',
    },
  };

  const mockEventDto: any = {
    title: 'Test Event',
    description: 'Test Description',
    dateTime: '2024-12-31T10:00:00Z',
    location: 'Test Location',
    maxCapacity: 100,
  };

  const mockEvent = {
    id: '1',
    ...mockEventDto,
    dateTime: new Date(mockEventDto.dateTime),
    remainingPlaces: 100,
    managerId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'DRAFT',
  };

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    publish: jest.fn(),
    cancel: jest.fn(),
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
    const result = await controller.create(mockEventDto, mockRequest);
    expect(result).toEqual(mockEvent);
    expect(mockService.create).toHaveBeenCalled();
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
    const result = await controller.update('1', mockEventDto, mockRequest);
    expect(result).toEqual(mockEvent);
  });

  it('should delete event', async () => {
    mockService.delete.mockResolvedValue(mockEvent);
    const result = await controller.delete('1', mockRequest);
    expect(result).toEqual(mockEvent);
  });
});