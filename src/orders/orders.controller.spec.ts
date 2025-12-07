import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '@/orders/orders.controller';
import { OrdersService } from '@/orders/orders.service';
import { CreateOrderDto } from '@/orders/dto/create-order.dto';
import { UpdateOrderDto } from '@/orders/dto/update-order.dto';
import { Order } from '@/orders/entities/order.entity';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrder: Order = {
    id: 1,
    orderDescription: 'Test Order',
    createdAt: new Date(),
  };

  const mockOrdersService = {
    getAllOrders: jest.fn(),
    getOrderById: jest.fn(),
    createOrder: jest.fn(),
    updateOrder: jest.fn(),
    deleteOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('should return paginated orders', async () => {
      const paginatedResponse = {
        data: [mockOrder],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
      mockOrdersService.getAllOrders.mockResolvedValue(paginatedResponse);

      const result = await controller.getAllOrders({});

      expect(result).toEqual(paginatedResponse);
      expect(service.getAllOrders).toHaveBeenCalledWith({});
    });

    it('should return paginated orders with custom pagination', async () => {
      const paginationQuery = { page: 2, limit: 5 };
      const paginatedResponse = {
        data: [mockOrder],
        meta: {
          total: 25,
          page: 2,
          limit: 5,
          totalPages: 5,
        },
      };
      mockOrdersService.getAllOrders.mockResolvedValue(paginatedResponse);

      const result = await controller.getAllOrders(paginationQuery);

      expect(result).toEqual(paginatedResponse);
      expect(service.getAllOrders).toHaveBeenCalledWith(paginationQuery);
    });
  });

  describe('getOrderById', () => {
    it('should return a single order', async () => {
      mockOrdersService.getOrderById.mockResolvedValue(mockOrder);

      const result = await controller.getOrderById(1);

      expect(result).toEqual(mockOrder);
      expect(service.getOrderById).toHaveBeenCalledWith(1);
    });
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const createOrderDto: CreateOrderDto = {
        orderDescription: 'New Order',
      };

      mockOrdersService.createOrder.mockResolvedValue(mockOrder);

      const result = await controller.createOrder(createOrderDto);

      expect(result).toEqual(mockOrder);
      expect(service.createOrder).toHaveBeenCalledWith(createOrderDto);
    });
  });

  describe('updateOrder', () => {
    it('should update an order', async () => {
      const updateOrderDto: UpdateOrderDto = {
        orderDescription: 'Updated Order',
      };

      const updatedOrder = { ...mockOrder, ...updateOrderDto };
      mockOrdersService.updateOrder.mockResolvedValue(updatedOrder);

      const result = await controller.updateOrder(1, updateOrderDto);

      expect(result).toEqual(updatedOrder);
      expect(service.updateOrder).toHaveBeenCalledWith(1, updateOrderDto);
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order', async () => {
      const response = {
        message: 'Order with ID 1 has been deleted successfully',
      };
      mockOrdersService.deleteOrder.mockResolvedValue(response);

      const result = await controller.deleteOrder(1);

      expect(result).toEqual(response);
      expect(service.deleteOrder).toHaveBeenCalledWith(1);
    });
  });
});
