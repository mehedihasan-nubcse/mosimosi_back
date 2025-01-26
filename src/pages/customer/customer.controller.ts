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
import { AdminMetaRoles } from '../../decorator/admin-roles.decorator';
import { AdminRoles } from '../../enum/admin-roles.enum';
import { AdminRolesGuard } from '../../guards/admin-roles.guard';
import { AdminMetaPermissions } from '../../decorator/admin-permissions.decorator';
import { AdminPermissions } from '../../enum/admin-permission.enum';
import { AdminPermissionGuard } from '../../guards/admin-permission.guard';
import { AdminJwtAuthGuard } from '../../guards/admin-jwt-auth.guard';
import {
  AddCustomerDto,
  FilterAndPaginationCustomerDto,
  OptionCustomerDto,
  UpdateCustomerDto,
} from '../../dto/customer.dto';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';
import { CustomerService } from './customer.service';


@Controller('customer')
export class CustomerController {
  private logger = new Logger(CustomerController.name);

  constructor(private customerService: CustomerService) {}

  /**
   * Public Api
   * getAllCustomerByShop()
   */
  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllCustomerByShop(
    @Body() filterCustomerDto: FilterAndPaginationCustomerDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.customerService.getAllCustomerByShop(
      shop,
      filterCustomerDto,
      searchString,
    );
  }

  /**
   * ADD DATA
   * addCustomer()
   * insertManyCustomer()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addCustomer(
    @Body()
    addCustomerDto: AddCustomerDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.customerService.addCustomer(shop, addCustomerDto);
  }

  /**
   * GET DATA
   * getAllCustomers()
   * getCustomerById()
   * getUserCustomerById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllCustomers(
    @Body() filterCustomerDto: FilterAndPaginationCustomerDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.customerService.getAllCustomers(
      filterCustomerDto,
      searchString,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-customer')
  async getCustomerByName(
    @Query('name') name: string,
  ): Promise<ResponsePayload> {
    return this.customerService.getCustomerByName(name);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getCustomerById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.customerService.getCustomerById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-customer/:id')
  @UsePipes(ValidationPipe)
  async getUserCustomerById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.customerService.getUserCustomerById(id, select);
  }

  /**
   * UPDATE DATA
   * updateCustomerById()
   * updateMultipleCustomerById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateCustomerById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<ResponsePayload> {
    return await this.customerService.updateCustomerById(id, updateCustomerDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleCustomerById(
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<ResponsePayload> {
    return await this.customerService.updateMultipleCustomerById(
      updateCustomerDto.ids,
      updateCustomerDto,
    );
  }

  /**
   * DELETE DATA
   * deleteCustomerById()
   * deleteMultipleCustomerById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteCustomerById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.customerService.deleteCustomerById(
      id,
      Boolean(checkUsage),
    );
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleCustomerById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.customerService.deleteMultipleCustomerById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
