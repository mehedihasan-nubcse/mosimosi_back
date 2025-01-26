import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { AdminMetaRoles } from '../../../decorator/admin-roles.decorator';
import { AdminRoles } from '../../../enum/admin-roles.enum';
import { AdminRolesGuard } from '../../../guards/admin-roles.guard';
import { AdminJwtAuthGuard } from '../../../guards/admin-jwt-auth.guard';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';
import { GetAdmin } from 'src/decorator/get-admin.decorator';
import { Admin } from 'src/interfaces/admin/admin.interface';
import { PASSPORT_ADMIN_TOKEN_TYPE } from 'src/core/global-variables';
import { AuthGuard } from '@nestjs/passport';
import {
  AddPreOrderDto,
  FilterAndPaginationPreOrderDto,
  UpdatePreOrderDto,
} from '../../../dto/pre-order.dto';
import { PreOrderService } from './pre-order.service';

@Controller('pre-order')
export class PreOrderController {
  private logger = new Logger(PreOrderController.name);

  constructor(private preOrderService: PreOrderService) {}

  /**
   * Public Api
   * getAllPreOrderByShop()
   */
  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllPreOrderByShop(
    @Body() filterPreOrderDto: FilterAndPaginationPreOrderDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.preOrderService.getAllPreOrderByShop(
      shop,
      filterPreOrderDto,
      searchString,
    );
  }

  /**
   * ADD DATA
   * addPreOrder()
   * insertManyPreOrder()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async addPreOrder(
    @Body()
    addPreOrderDto: AddPreOrderDto,
    @GetAdmin() admin: Admin,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.preOrderService.addPreOrder(shop, addPreOrderDto, admin);
  }

  /**
   * GET DATA
   * getAllPreOrder()
   * getPreOrderById()
   * getUserPreOrderById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async getAllPreOrder(
    @Body() filterPreOrderDto: FilterAndPaginationPreOrderDto,
    @Query('q') searchString: string,
    @GetAdmin() salesman: Admin,
  ): Promise<ResponsePayload> {
    return this.preOrderService.getAllPreOrder(filterPreOrderDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Post('/get-by-month')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async getAllPreOrderByMonth(
    @Body() filterPreOrderDto: FilterAndPaginationPreOrderDto,
    @Query('q') searchString: string,
    @GetAdmin() salesman: Admin,
  ): Promise<ResponsePayload> {
    return this.preOrderService.getAllPreOrder(filterPreOrderDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-preOrder')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async getPreOrderByDate(
    @Query('date') date: string,
    @GetAdmin() salesman: Admin,
  ): Promise<ResponsePayload> {
    return this.preOrderService.getPreOrderByDate(date);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async getPreOrderById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
    @GetAdmin() salesman: Admin,
  ): Promise<ResponsePayload> {
    return await this.preOrderService.getPreOrderById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-customer-preOrder/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  async getCustomerPreOrderById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
    @GetAdmin() salesman: Admin,
  ): Promise<ResponsePayload> {
    return await this.preOrderService.getCustomerPreOrderById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-salesman-preOrder/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getPreOrdermanPreOrderById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
    @GetAdmin() salesman: Admin,
  ): Promise<ResponsePayload> {
    return await this.preOrderService.getPreOrdermanPreOrderById(id, select);
  }

  /**
   * UPDATE DATA
   * updatePreOrderById()
   * updateMultiplePreOrderById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updatePreOrderById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updatePreOrderDto: UpdatePreOrderDto,
  ): Promise<ResponsePayload> {
    return await this.preOrderService.updatePreOrderById(id, updatePreOrderDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultiplePreOrderById(
    @Body() updatePreOrderDto: UpdatePreOrderDto,
  ): Promise<ResponsePayload> {
    return await this.preOrderService.updateMultiplePreOrderById(
      updatePreOrderDto.ids,
      updatePreOrderDto,
    );
  }

  /**
   * DELETE DATA
   * deletePreOrderById()
   * deleteMultiplePreOrderById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deletePreOrderById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.preOrderService.deletePreOrderById(
      id,
      Boolean(checkUsage),
    );
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultiplePreOrderById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.preOrderService.deleteMultiplePreOrderById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
