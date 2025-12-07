import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersService } from '@/orders/orders.service';
import { Order } from '@/orders/entities/order.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from '@/orders/dto/create-order.dto';
import { UpdateOrderDto } from '@/orders/dto/update-order.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: Repository<Order>;

  const mockOrderRepository = {
    find: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockOrder: Order = {
    id: 1,
    orderDescription: 'Test Order',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('should return paginated orders with default pagination', async () => {
      const orders = [mockOrder];
      mockOrderRepository.findAndCount.mockResolvedValue([orders, 1]);

      const result = await service.getAllOrders({});

      expect(result).toEqual({
        data: orders,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
      expect(mockOrderRepository.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should return paginated orders with custom pagination', async () => {
      const orders = [mockOrder];
      mockOrderRepository.findAndCount.mockResolvedValue([orders, 25]);

      const result = await service.getAllOrders({ page: 2, limit: 5 });

      expect(result).toEqual({
        data: orders,
        meta: {
          total: 25,
          page: 2,
          limit: 5,
          totalPages: 5,
        },
      });
      expect(mockOrderRepository.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        skip: 5,
        take: 5,
      });
    });
  });

  describe('getOrderById', () => {
    it('should return a single order', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.getOrderById(1);

      expect(result).toEqual(mockOrder);
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.getOrderById(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.getOrderById(0)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getOrderById(-1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createOrder', () => {
    it('should create and return a new order', async () => {
      const createOrderDto: CreateOrderDto = {
        orderDescription: 'New Order',
      };

      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);

      const result = await service.createOrder(createOrderDto);

      expect(result).toEqual(mockOrder);
      expect(mockOrderRepository.create).toHaveBeenCalled();
      expect(mockOrderRepository.save).toHaveBeenCalledWith(mockOrder);
    });
  });

  describe('updateOrder', () => {
    it('should update and return the order', async () => {
      const updateOrderDto: UpdateOrderDto = {
        orderDescription: 'Updated Order',
      };

      const updatedOrder = { ...mockOrder, ...updateOrderDto };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(updatedOrder);

      const result = await service.updateOrder(1, updateOrderDto);

      expect(result.orderDescription).toEqual(updateOrderDto.orderDescription);
      expect(mockOrderRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateOrder(999, { orderDescription: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(
        service.updateOrder(0, { orderDescription: 'Test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order and return success message', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderRepository.remove.mockResolvedValue(mockOrder);

      const result = await service.deleteOrder(1);

      expect(result).toEqual({
        message: 'Order with ID 1 has been deleted successfully',
      });
      expect(mockOrderRepository.remove).toHaveBeenCalledWith(mockOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteOrder(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.deleteOrder(0)).rejects.toThrow(BadRequestException);
    });
  });
});
