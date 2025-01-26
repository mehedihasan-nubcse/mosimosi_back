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
import { ProductPurchaseLogService } from './product-purchase-log.service';
import {
  AddColorDto,
  FilterAndPaginationColorDto,
} from '../../../dto/color.dto';
import {
  AddProductPurchaseLogDto,
  FilterAndPaginationProductPurchaseLogDto,
  UpdateProductPurchaseLogDto,
} from '../../../dto/product-purchase-log.dto';

@Controller('productPurchaseLog')
export class ProductPurchaseLogController {
  private logger = new Logger(ProductPurchaseLogController.name);

  constructor(private productPurchaseLogService: ProductPurchaseLogService) {}

  /**
   * ADD DATA
   * addProductPurchaseLog()
   * insertManyProductPurchaseLog()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addProductPurchaseLog(
    @Body()
    addProductPurchaseLogDto: AddProductPurchaseLogDto,
  ): Promise<ResponsePayload> {
    return await this.productPurchaseLogService.addProductPurchaseLog(
      addProductPurchaseLogDto,
    );
  }

  @Post('/add-by-shop')
  @UsePipes(ValidationPipe)
  async addProductPurchaseLogByShop(
    @Body()
    addColorDto: AddColorDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.productPurchaseLogService.addProductPurchaseLogByShop(
      shop,
      addColorDto,
    );
  }

  /**
   * GET DATA
   * getAllProductPurchaseLogs()
   * getProductPurchaseLogById()
   * getUserProductPurchaseLogById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllProductPurchaseLogs(
    @Body()
    filterProductPurchaseLogDto: FilterAndPaginationProductPurchaseLogDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.productPurchaseLogService.getAllProductPurchases(
      filterProductPurchaseLogDto,
      searchString,
    );
  }

  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllProductPurchaseLogByShop(
    @Body() filterColorDto: FilterAndPaginationColorDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.productPurchaseLogService.getAllProductPurchaseLogByShop(
      shop,
      filterColorDto,
      searchString,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-productPurchaseLog')
  async getProductPurchaseLogByName(
    @Query('name') name: string,
  ): Promise<ResponsePayload> {
    return this.productPurchaseLogService.getProductPurchaseLogByName(name);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getProductPurchaseLogById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.productPurchaseLogService.getProductPurchaseLogById(
      id,
      select,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-productPurchaseLog/:id')
  @UsePipes(ValidationPipe)
  async getUserProductPurchaseLogById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.productPurchaseLogService.getUserProductPurchaseLogById(
      id,
      select,
    );
  }

  /**
   * UPDATE DATA
   * updateProductPurchaseLogById()
   * updateMultipleProductPurchaseLogById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateProductPurchaseLogById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateProductPurchaseLogDto: UpdateProductPurchaseLogDto,
  ): Promise<ResponsePayload> {
    return await this.productPurchaseLogService.updateProductPurchaseLogById(
      id,
      updateProductPurchaseLogDto,
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
  async updateMultipleProductPurchaseLogById(
    @Body() updateProductPurchaseLogDto: UpdateProductPurchaseLogDto,
  ): Promise<ResponsePayload> {
    return await this.productPurchaseLogService.updateMultipleProductPurchaseLogById(
      updateProductPurchaseLogDto.ids,
      updateProductPurchaseLogDto,
    );
  }

  /**
   * DELETE DATA
   * deleteProductPurchaseLogById()
   * deleteMultipleProductPurchaseLogById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteProductPurchaseLogById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.productPurchaseLogService.deleteProductPurchaseLogById(
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
  async deleteMultipleProductPurchaseLogById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.productPurchaseLogService.deleteMultipleProductPurchaseLogById(
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
    return await this.productPurchaseLogService.restoreMultipleProductLogById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
