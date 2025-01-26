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
import {
  AddProductLogDto,
  FilterAndPaginationProductLogDto,
  UpdateProductLogDto,
} from '../../../dto/product-log.dto';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';
import { ProductLogService } from './product-log.service';
import {
  AddColorDto,
  FilterAndPaginationColorDto,
} from '../../../dto/color.dto';

@Controller('product-log')
export class ProductLogController {
  private logger = new Logger(ProductLogController.name);

  constructor(private productLogService: ProductLogService) {}

  /**
   * ADD DATA
   * addProductLog()
   * insertManyProductLog()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addProductLog(
    @Body()
    addProductLogDto: AddProductLogDto,
  ): Promise<ResponsePayload> {
    return await this.productLogService.addProductLog(addProductLogDto);
  }

  @Post('/add-by-shop')
  @UsePipes(ValidationPipe)
  async addProductLogByShop(
    @Body()
    addColorDto: AddColorDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.productLogService.addProductLogByShop(shop, addColorDto);
  }

  /**
   * GET DATA
   * getAllProductLogs()
   * getProductLogById()
   * getUserProductLogById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllProductLogs(
    @Body() filterProductLogDto: FilterAndPaginationProductLogDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.productLogService.getAllProducts(
      filterProductLogDto,
      searchString,
    );
  }

  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllProductLogByShop(
    @Body() filterColorDto: FilterAndPaginationColorDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.productLogService.getAllProductLogByShop(
      shop,
      filterColorDto,
      searchString,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-productLog')
  async getProductLogByName(
    @Query('name') name: string,
  ): Promise<ResponsePayload> {
    return this.productLogService.getProductLogByName(name);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getProductLogById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.productLogService.getProductLogById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-productLog/:id')
  @UsePipes(ValidationPipe)
  async getUserProductLogById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.productLogService.getUserProductLogById(id, select);
  }

  /**
   * UPDATE DATA
   * updateProductLogById()
   * updateMultipleProductLogById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateProductLogById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateProductLogDto: UpdateProductLogDto,
  ): Promise<ResponsePayload> {
    return await this.productLogService.updateProductLogById(
      id,
      updateProductLogDto,
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
  async updateMultipleProductLogById(
    @Body() updateProductLogDto: UpdateProductLogDto,
  ): Promise<ResponsePayload> {
    return await this.productLogService.updateMultipleProductLogById(
      updateProductLogDto.ids,
      updateProductLogDto,
    );
  }

  /**
   * DELETE DATA
   * deleteProductLogById()
   * deleteMultipleProductLogById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteProductLogById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.productLogService.deleteProductLogById(
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
  async deleteMultipleProductLogById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.productLogService.deleteMultipleProductLogById(
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
    return await this.productLogService.restoreMultipleProductLogById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
