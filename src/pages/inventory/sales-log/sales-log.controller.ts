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
import { AdminMetaPermissions } from '../../../decorator/admin-permissions.decorator';
import { AdminPermissions } from '../../../enum/admin-permission.enum';
import { AdminPermissionGuard } from '../../../guards/admin-permission.guard';
import { AdminJwtAuthGuard } from '../../../guards/admin-jwt-auth.guard';

import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';
import { SalesLogService } from './sales-log.service';
import {
  AddColorDto,
  FilterAndPaginationColorDto,
} from '../../../dto/color.dto';
import {
  AddSalesLogDto,
  FilterAndPaginationSalesLogDto,
  UpdateSalesLogDto,
} from '../../../dto/sales-log.dto';

@Controller('salesLog')
export class SalesLogController {
  private logger = new Logger(SalesLogController.name);

  constructor(private salesLogService: SalesLogService) {}

  /**
   * ADD DATA
   * addSalesLog()
   * insertManySalesLog()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addSalesLog(
    @Body()
    addSalesLogDto: AddSalesLogDto,
  ): Promise<ResponsePayload> {
    return await this.salesLogService.addSalesLog(addSalesLogDto);
  }

  @Post('/add-by-shop')
  @UsePipes(ValidationPipe)
  async addSalesLogByShop(
    @Body()
    addColorDto: AddColorDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.salesLogService.addSalesLogByShop(shop, addColorDto);
  }

  /**
   * GET DATA
   * getAllSalesLogs()
   * getSalesLogById()
   * getUserSalesLogById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllSalesLogs(
    @Body() filterSalesLogDto: FilterAndPaginationSalesLogDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.salesLogService.getAllSales(
      filterSalesLogDto,
      searchString,
    );
  }

  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllSalesLogByShop(
    @Body() filterColorDto: FilterAndPaginationColorDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.salesLogService.getAllSalesLogByShop(
      shop,
      filterColorDto,
      searchString,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-salesLog')
  async getSalesLogByName(
    @Query('name') name: string,
  ): Promise<ResponsePayload> {
    return this.salesLogService.getSalesLogByName(name);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getSalesLogById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.salesLogService.getSalesLogById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-salesLog/:id')
  @UsePipes(ValidationPipe)
  async getUserSalesLogById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.salesLogService.getUserSalesLogById(id, select);
  }

  /**
   * UPDATE DATA
   * updateSalesLogById()
   * updateMultipleSalesLogById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateSalesLogById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateSalesLogDto: UpdateSalesLogDto,
  ): Promise<ResponsePayload> {
    return await this.salesLogService.updateSalesLogById(id, updateSalesLogDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleSalesLogById(
    @Body() updateSalesLogDto: UpdateSalesLogDto,
  ): Promise<ResponsePayload> {
    return await this.salesLogService.updateMultipleSalesLogById(
      updateSalesLogDto.ids,
      updateSalesLogDto,
    );
  }

  /**
   * DELETE DATA
   * deleteSalesLogById()
   * deleteMultipleSalesLogById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteSalesLogById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.salesLogService.deleteSalesLogById(
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
  async deleteMultipleSalesLogById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.salesLogService.deleteMultipleSalesLogById(
      data.ids,
      Boolean(checkUsage),
    );
  }

  @Version(VERSION_NEUTRAL)
  @Post('/restore-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async restoreMultipleProductLogById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.salesLogService.restoreMultipleProductLogById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
