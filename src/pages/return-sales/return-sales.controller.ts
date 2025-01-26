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
  AddReturnSalesDto,
  FilterAndPaginationReturnSalesDto,
  UpdateReturnSalesDto,
} from '../../dto/return-sales.dto';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';
import { ReturnSalesService } from './return-sales.service';
import { GetTokenUser } from '../../decorator/get-token-user.decorator';
import { Admin } from '../../interfaces/admin/admin.interface';

@Controller('new-sales-return')
export class ReturnSalesController {
  private logger = new Logger(ReturnSalesController.name);

  constructor(private returnSalesService: ReturnSalesService) {}

  /**
   * Public Api
   * getAllReturnSalesByShop()
   */
  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllReturnSalesByShop(
    @Body() filterReturnSalesDto: FilterAndPaginationReturnSalesDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.returnSalesService.getAllReturnSalesByShop(
      shop,
      filterReturnSalesDto,
      searchString,
    );
  }

  /**
   * ADD DATA
   * addReturnSales()
   * insertManyReturnSales()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  @UseGuards(AdminJwtAuthGuard)
  async addReturnSales(
    @GetTokenUser() admin: Admin,
    @Body()
    addReturnSalesDto: AddReturnSalesDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.returnSalesService.addReturnSales(
      shop,
      admin,
      addReturnSalesDto,
    );
  }

  /**
   * GET DATA
   * getAllReturnSaless()
   * getReturnSalesById()
   * getUserReturnSalesById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllReturnSales(
    @Body() filterReturnSalesDto: FilterAndPaginationReturnSalesDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.returnSalesService.getAllReturnSales(
      filterReturnSalesDto,
      searchString,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-return-sales')
  async getReturnSalesByDate(
    @Query('date') date: string,
  ): Promise<ResponsePayload> {
    return this.returnSalesService.getReturnSalesByDate(date);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getReturnSalesById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.returnSalesService.getReturnSalesById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-return-sales/:id')
  @UsePipes(ValidationPipe)
  async getUserReturnSalesById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.returnSalesService.getUserReturnSalesById(id, select);
  }

  /**
   * UPDATE DATA
   * updateReturnSalesById()
   * updateMultipleReturnSalesById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateReturnSalesById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateReturnSalesDto: UpdateReturnSalesDto,
  ): Promise<ResponsePayload> {
    return await this.returnSalesService.updateReturnSalesById(
      id,
      updateReturnSalesDto,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleReturnSalesById(
    @Body() updateReturnSalesDto: UpdateReturnSalesDto,
  ): Promise<ResponsePayload> {
    return await this.returnSalesService.updateMultipleReturnSalesById(
      updateReturnSalesDto.ids,
      updateReturnSalesDto,
    );
  }

  /**
   * DELETE DATA
   * deleteReturnSalesById()
   * deleteMultipleReturnSalesById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteReturnSalesById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.returnSalesService.deleteReturnSalesById(
      id,
      Boolean(checkUsage),
    );
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleReturnSalesById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.returnSalesService.deleteMultipleReturnSalesById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
