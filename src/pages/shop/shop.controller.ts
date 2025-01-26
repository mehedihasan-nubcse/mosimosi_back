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

import { MongoIdValidationPipe } from 'src/pipes/mongo-id-validation.pipe';

import { AdminRoles } from 'src/enum/admin-roles.enum';

import { AdminPermissions } from 'src/enum/admin-permission.enum';

import { ShopService } from './shop.service';
import {
  AddShopDto,
  CheckShopAvailabilityDto,
  FilterAndPaginationShopDto,
  InsertManyShopDto,
  UpdateShopDto,
} from './dto/shop.dto';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { AdminRolesGuard } from '../../guards/admin-roles.guard';
import { AdminMetaPermissions } from '../../decorator/admin-permissions.decorator';
import { AdminPermissionGuard } from '../../guards/admin-permission.guard';
import { AdminJwtAuthGuard } from '../../guards/admin-jwt-auth.guard';
import { AdminMetaRoles } from '../../decorator/admin-roles.decorator';

@Controller('shop')
export class ShopController {
  private logger = new Logger(ShopController.name);

  constructor(private shopService: ShopService) {}

  /**
   * checkShopAvailability()
   * addShop()
   * insertManyShop()
   * getAllShop()
   * getAllShopBasic()
   * getShopById()
   * updateShopById()
   * updateMultipleShopById()
   * deleteShopById()
   * deleteMultipleShopById()
   */

  @Post('/check-shop-availability')
  @UsePipes(ValidationPipe)
  async checkShopAvailability(
    @Body()
    checkShopAvailabilityDto: CheckShopAvailabilityDto,
  ): Promise<ResponsePayload> {
    return await this.shopService.checkShopAvailability(
      checkShopAvailabilityDto,
    );
  }

  @Post('/create')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.ADMIN, AdminRoles.SUPER_ADMIN, AdminRoles.EDITOR)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async createShop(
    @Body()
    addShopDto: AddShopDto,
  ): Promise<ResponsePayload> {
    return await this.shopService.createShop(addShopDto);
  }

  @Post('/add')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.ADMIN, AdminRoles.SUPER_ADMIN, AdminRoles.EDITOR)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async addShop(
    @Body()
    addShopDto: AddShopDto,
  ): Promise<ResponsePayload> {
    return await this.shopService.createShop(addShopDto);
  }

  @Post('/insert-many')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async insertManyShop(
    @Body()
    body: InsertManyShopDto,
  ): Promise<ResponsePayload> {
    return await this.shopService.insertManyShop(body.data, body.option);
  }

  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllShop(
    @Body() filterShopDto: FilterAndPaginationShopDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.shopService.getAllShop(filterShopDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-all-basic')
  async getAllShopBasic(): Promise<ResponsePayload> {
    return await this.shopService.getAllShopBasic();
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by/:id')
  async getShopById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('select') select: string,
  ): Promise<ResponsePayload> {
    return await this.shopService.getShopById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-page/:pageName')
  @UsePipes(ValidationPipe)
  async getShopPageByPage(
    @Param('pageName') pageName: string,
    @Query('select') select: string,
  ): Promise<ResponsePayload> {
    return await this.shopService.getShopPageByPage(pageName, select);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(
    AdminRoles.SUPER_ADMIN,
    AdminRoles.SUPER_ADMIN,
    AdminRoles.EDITOR,
  )
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateShopById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateShopDto: UpdateShopDto,
  ): Promise<ResponsePayload> {
    return await this.shopService.updateShopById(id, updateShopDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleShopById(
    @Body() updateShopDto: UpdateShopDto,
  ): Promise<ResponsePayload> {
    return await this.shopService.updateMultipleShopById(
      updateShopDto.ids,
      updateShopDto,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(
    AdminRoles.SUPER_ADMIN,
    AdminRoles.SUPER_ADMIN,
    AdminRoles.EDITOR,
  )
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteShopById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.shopService.deleteShopById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(
    AdminRoles.SUPER_ADMIN,
    AdminRoles.SUPER_ADMIN,
    AdminRoles.EDITOR,
  )
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleShopById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.shopService.deleteMultipleShopById(
      data.ids,
      Boolean(checkUsage),
    );
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-shop-category')
  async getShopCategory(): Promise<ResponsePayload> {
    return await this.shopService.getShopCategory();
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-shop-sub-category')
  async getShopSubCategory(): Promise<ResponsePayload> {
    return await this.shopService.getShopSubCategory();
  }
}
