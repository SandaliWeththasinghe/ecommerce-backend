import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';

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
    it('should return an array of orders', async () => {
      const orders = [mockOrder];
      mockOrdersService.getAllOrders.mockResolvedValue(orders);

      const result = await controller.getAllOrders();

      expect(result).toEqual(orders);
      expect(service.getAllOrders).toHaveBeenCalled();
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
