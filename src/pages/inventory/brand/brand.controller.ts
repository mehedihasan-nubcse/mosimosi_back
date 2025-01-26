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
  AddBrandDto,
  FilterAndPaginationBrandDto,
  OptionBrandDto,
  UpdateBrandDto,
} from '../../../dto/brand.dto';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';
import { BrandService } from './brand.service';
import { AddColorDto, FilterAndPaginationColorDto } from '../../../dto/color.dto';

@Controller('brand')
export class BrandController {
  private logger = new Logger(BrandController.name);

  constructor(private brandService: BrandService) {}

  /**
   * ADD DATA
   * addBrand()
   * insertManyBrand()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addBrand(
    @Body()
    addBrandDto: AddBrandDto,
  ): Promise<ResponsePayload> {
    return await this.brandService.addBrand(addBrandDto);
  }

  @Post('/add-by-shop')
  @UsePipes(ValidationPipe)
  async addBrandByShop(
    @Body()
      addColorDto: AddColorDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.brandService.addBrandByShop(shop, addColorDto);
  }

  /**
   * GET DATA
   * getAllBrands()
   * getBrandById()
   * getUserBrandById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllBrands(
    @Body() filterBrandDto: FilterAndPaginationBrandDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.brandService.getAllBrands(filterBrandDto, searchString);
  }

  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllBrandByShop(
    @Body() filterColorDto: FilterAndPaginationColorDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.brandService.getAllBrandByShop(
      shop,
      filterColorDto,
      searchString,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-brand')
  async getBrandByName(@Query('name') name: string): Promise<ResponsePayload> {
    return this.brandService.getBrandByName(name);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getBrandById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.brandService.getBrandById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-brand/:id')
  @UsePipes(ValidationPipe)
  async getUserBrandById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.brandService.getUserBrandById(id, select);
  }

  /**
   * UPDATE DATA
   * updateBrandById()
   * updateMultipleBrandById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateBrandById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ): Promise<ResponsePayload> {
    return await this.brandService.updateBrandById(id, updateBrandDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleBrandById(
    @Body() updateBrandDto: UpdateBrandDto,
  ): Promise<ResponsePayload> {
    return await this.brandService.updateMultipleBrandById(
      updateBrandDto.ids,
      updateBrandDto,
    );
  }

  /**
   * DELETE DATA
   * deleteBrandById()
   * deleteMultipleBrandById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteBrandById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.brandService.deleteBrandById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleBrandById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.brandService.deleteMultipleBrandById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
