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
import { AdminMetaPermissions } from '../../../decorator/admin-permissions.decorator';
import { AdminPermissions } from '../../../enum/admin-permission.enum';
import { AdminPermissionGuard } from '../../../guards/admin-permission.guard';
import { AdminJwtAuthGuard } from '../../../guards/admin-jwt-auth.guard';
import {
  AddProductPurchaseDto,
  FilterAndPaginationProductPurchaseDto,
  UpdateProductPurchaseDto,
} from '../../../dto/product-purchase.dto';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';
import { ProductPurchaseService } from './product-purchase.service';

@Controller('product-purchase')
export class ProductPurchaseController {
  private logger = new Logger(ProductPurchaseController.name);

  constructor(private productPurchaseService: ProductPurchaseService) {}

  /**
   * Public Api
   * getAllProductPurchaseByShop()
   */
  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllProductPurchaseByShop(
    @Body() filterProductPurchaseDto: FilterAndPaginationProductPurchaseDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.productPurchaseService.getAllProductPurchaseByShop(
      shop,
      filterProductPurchaseDto,
      searchString,
    );
  }

  /**
   * Public Api
   * getAllGroupProductByShop()
   */
  @Get('similar/:id')
  async getSimilarProducts(
    @Param('id') productId: string,
    @Query('dateString') dateString: string,
  ) {
    try {
      return await this.productPurchaseService.getSimilarProductPurchasesByProductId(
        productId,
        dateString,
      );
    } catch (error) {
      // Handle error if needed, for now we return the error directly
      throw error;
    }
  }

  /**
   * ADD DATA
   * addProductPurchase()
   * insertManyProductPurchase()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addProductPurchase(
    @Body()
    addProductPurchaseDto: AddProductPurchaseDto,
  ): Promise<ResponsePayload> {
    return await this.productPurchaseService.addProductPurchase(
      addProductPurchaseDto,
    );
  }

  /**
   * GET DATA
   * getAllProductPurchases()
   * getProductPurchaseById()
   * getUserProductPurchaseById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllProductPurchases(
    @Body() filterProductPurchaseDto: FilterAndPaginationProductPurchaseDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.productPurchaseService.getAllProductPurchases(
      filterProductPurchaseDto,
      searchString,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-productPurchase')
  async getProductPurchaseByDate(
    @Query('date') date: string,
  ): Promise<ResponsePayload> {
    return this.productPurchaseService.getProductPurchaseByDate(date);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getProductPurchaseById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.productPurchaseService.getProductPurchaseById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-productPurchase/:id')
  @UsePipes(ValidationPipe)
  async getUserProductPurchaseById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.productPurchaseService.getUserProductPurchaseById(
      id,
      select,
    );
  }

  /**
   * UPDATE DATA
   * updateProductPurchaseById()
   * updateMultipleProductPurchaseById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateProductPurchaseById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateProductPurchaseDto: UpdateProductPurchaseDto,
  ): Promise<ResponsePayload> {
    return await this.productPurchaseService.updateProductPurchaseById(
      id,
      updateProductPurchaseDto,
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
  async updateMultipleProductPurchaseById(
    @Body() updateProductPurchaseDto: UpdateProductPurchaseDto,
  ): Promise<ResponsePayload> {
    return await this.productPurchaseService.updateMultipleProductPurchaseById(
      updateProductPurchaseDto.ids,
      updateProductPurchaseDto,
    );
  }

  /**
   * DELETE DATA
   * deleteProductPurchaseById()
   * deleteMultipleProductPurchaseById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteProductPurchaseById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.productPurchaseService.deleteProductPurchaseById(
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
  async deleteMultipleProductPurchaseById(
    @Body() data: { ids: string[] },
    @Req() req: any,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.productPurchaseService.deleteMultipleProductPurchaseById(
      req.user,
      data.ids,
      Boolean(checkUsage),
    );
  }
}
