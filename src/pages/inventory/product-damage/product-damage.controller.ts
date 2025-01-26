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
  AddProductDamageDto,
  FilterAndPaginationProductDamageDto,
  OptionProductDamageDto,
  UpdateProductDamageDto,
} from '../../../dto/product-damage.dto';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';
import { ProductDamageService } from './product-damage.service';

@Controller('product-damage')
export class ProductDamageController {
  private logger = new Logger(ProductDamageController.name);

  constructor(private productDamageService: ProductDamageService) {}

  /**
   * Public Api
   * getAllProductDamageByShop()
   */
  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllProductDamageByShop(
    @Body() filterProductDamageDto: FilterAndPaginationProductDamageDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.productDamageService.getAllProductDamageByShop(
      shop,
      filterProductDamageDto,
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
      return await this.productDamageService.getSimilarProductPurchasesByProductId(
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
   * addProductDamage()
   * insertManyProductDamage()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addProductDamage(
    @Body()
    addProductDamageDto: AddProductDamageDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.productDamageService.addProductDamage(
      shop,
      addProductDamageDto,
    );
  }

  /**
   * GET DATA
   * getAllProductDamages()
   * getProductDamageById()
   * getUserProductDamageById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllProductDamages(
    @Body() filterProductDamageDto: FilterAndPaginationProductDamageDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.productDamageService.getAllProductDamages(
      filterProductDamageDto,
      searchString,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-productDamage')
  async getProductDamageByDate(
    @Query('date') date: string,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return this.productDamageService.getProductDamageByDate(date);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getProductDamageById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.productDamageService.getProductDamageById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-productDamage/:id')
  @UsePipes(ValidationPipe)
  async getUserProductDamageById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.productDamageService.getUserProductDamageById(id, select);
  }

  /**
   * UPDATE DATA
   * updateProductDamageById()
   * updateMultipleProductDamageById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateProductDamageById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateProductDamageDto: UpdateProductDamageDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.productDamageService.updateProductDamageById(
      id,
      updateProductDamageDto,
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
  async updateMultipleProductDamageById(
    @Body() updateProductDamageDto: UpdateProductDamageDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.productDamageService.updateMultipleProductDamageById(
      updateProductDamageDto.ids,
      updateProductDamageDto,
    );
  }

  /**
   * DELETE DATA
   * deleteProductDamageById()
   * deleteMultipleProductDamageById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteProductDamageById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.productDamageService.deleteProductDamageById(
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
  async deleteMultipleProductDamageById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
    @Req() req: any,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.productDamageService.deleteMultipleProductDamageById(
      req.user,
      data.ids,
      Boolean(checkUsage),
    );
  }
}
