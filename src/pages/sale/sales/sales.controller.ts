import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query, Req,
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
import {
  AddSalesDto,
  FilterAndPaginationSalesDto,
  OptionSalesDto,
  UpdateSalesDto,
} from '../../../dto/sales.dto';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';
import { SalesService } from './sales.service';
import { GetAdmin } from 'src/decorator/get-admin.decorator';
import { Admin } from 'src/interfaces/admin/admin.interface';
import { PASSPORT_ADMIN_TOKEN_TYPE } from 'src/core/global-variables';
import { AuthGuard } from '@nestjs/passport';

@Controller('sales')
export class SalesController {
  private logger = new Logger(SalesController.name);

  constructor(private salesService: SalesService) {}

  /**
   * Public Api
   * getAllSalesByShop()
   */
  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllSalesByShop(
    @Body() filterSalesDto: FilterAndPaginationSalesDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.salesService.getAllSalesByShop(
      shop,
      filterSalesDto,
      searchString,
    );
  }

 /**
   * Public Api
   * getAllSalesByShop()
   */
  @Post('/get-all-return-by-shop')
  @UsePipes(ValidationPipe)
  async getAllReturnSalesByShop(
    @Body() filterSalesDto: FilterAndPaginationSalesDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.salesService.getAllReturnSalesByShop(
      shop,
      filterSalesDto,
      searchString,
    );
  }



  /**
   * ADD DATA
   * addSales()
   * insertManySales()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async addSales(
    @Body()
    addSalesDto: AddSalesDto,
    @GetAdmin() admin: Admin,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.salesService.addSales(shop, addSalesDto, admin);
  }

  /**
   * GET DATA
   * getAllSales()
   * getSalesById()
   * getUserSalesById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async getAllSales(
    @Body() filterSalesDto: FilterAndPaginationSalesDto,
    @Query('q') searchString: string,
    @GetAdmin() salesman: Admin,
  ): Promise<ResponsePayload> {
    return this.salesService.getAllSales(filterSalesDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Post('/get-all-product-sale')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async getProductSales(
    @Body() filterSalesDto: FilterAndPaginationSalesDto,
    @Query('q') searchString: string,
    @GetAdmin() salesman: Admin,
  ): Promise<ResponsePayload> {
    return this.salesService.getProductSales(filterSalesDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Post('/get-by-month')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async getAllSalesByMonth(
    @Body() filterSalesDto: FilterAndPaginationSalesDto,
    @Query('q') searchString: string,
    @GetAdmin() salesman: Admin,
  ): Promise<ResponsePayload> {
    return this.salesService.getAllSales(filterSalesDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-sales')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async getSalesByDate(
    @Query('date') date: string,
    @GetAdmin() salesman: Admin,
  ): Promise<ResponsePayload> {
    return this.salesService.getSalesByDate(date);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async getSalesById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
    @GetAdmin() salesman: Admin,
  ): Promise<ResponsePayload> {
    return await this.salesService.getSalesById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-customer-sales/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  async getCustomerSalesById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
    @GetAdmin() salesman: Admin,
  ): Promise<ResponsePayload> {
    return await this.salesService.getCustomerSalesById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-salesman-sales/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getSalesmanSalesById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
    @GetAdmin() salesman: Admin,
  ): Promise<ResponsePayload> {
    return await this.salesService.getSalesmanSalesById(id, select);
  }

  /**
   * UPDATE DATA
   * updateSalesById()
   * updateMultipleSalesById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateSalesById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateSalesDto: UpdateSalesDto,
  ): Promise<ResponsePayload> {
    return await this.salesService.updateSalesById(id, updateSalesDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleSalesById(
    @Body() updateSalesDto: UpdateSalesDto,
  ): Promise<ResponsePayload> {
    return await this.salesService.updateMultipleSalesById(
      updateSalesDto.ids,
      updateSalesDto,
    );
  }

  /**
   * DELETE DATA
   * deleteSalesById()
   * deleteMultipleSalesById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteSalesById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.salesService.deleteSalesById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleSalesById(
    @Body() data: { ids: string[] },
    @Req() req: any,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.salesService.deleteMultipleSalesById(
      req.user,
      data.ids,
      Boolean(checkUsage),
    );
  }
}
