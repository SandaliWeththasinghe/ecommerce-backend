import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from '@/orders/orders.service';
import { Order } from '@/orders/entities/order.entity';
import { Product } from '@/orders/entities/product.entity';
import { OrderProductMap } from '@/orders/entities/order-product-map.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from '@/orders/dto/create-order.dto';
import { UpdateOrderDto } from '@/orders/dto/update-order.dto';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockOrderRepository = {
    find: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockProductRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
  };

  const mockOrderProductMapRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockOrder: Order = {
    id: 1,
    orderDescription: 'Test Order',
    createdAt: new Date(),
    orderProducts: []
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(OrderProductMap),
          useValue: mockOrderProductMapRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
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

      const mockQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([orders, 1]),
      };

      mockOrderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockOrderProductMapRepository.find.mockResolvedValue([]);

      const result = await service.getAllOrders({});

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should return paginated orders with custom pagination', async () => {
      const orders = [mockOrder];

      const mockQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([orders, 25]),
      };

      mockOrderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockOrderProductMapRepository.find.mockResolvedValue([]);

      const result = await service.getAllOrders({ page: 2, limit: 5 });

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        total: 25,
        page: 2,
        limit: 5,
        totalPages: 5,
      });
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
    });
  });

  describe('getOrderById', () => {
    it('should return a single order', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderProductMapRepository.find.mockResolvedValue([]);

      const result = await service.getOrderById(1);

      expect(result).toBeDefined();
      expect(result.id).toEqual(mockOrder.id);
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
        productIds: [1, 2],
      };

      const mockProducts = [
        { id: 1, productName: 'Product 1', productDescription: 'Desc 1' },
        { id: 2, productName: 'Product 2', productDescription: 'Desc 2' },
      ];

      mockProductRepository.find.mockResolvedValue(mockProducts);
      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockOrderProductMapRepository.save.mockResolvedValue({});
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderProductMapRepository.find.mockResolvedValue([]);

      const result = await service.createOrder(createOrderDto);

      expect(result).toBeDefined();
      expect(mockOrderRepository.create).toHaveBeenCalled();
      expect(mockOrderRepository.save).toHaveBeenCalled();
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
      mockOrderProductMapRepository.find.mockResolvedValue([]);

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
