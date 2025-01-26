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
  AddSupplierDto,
  FilterAndPaginationSupplierDto,
  OptionSupplierDto,
  UpdateSupplierDto,
} from '../../dto/supplier.dto';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';
import { SupplierService } from './supplier.service';

@Controller('supplier')
export class SupplierController {
  private logger = new Logger(SupplierController.name);

  constructor(private supplierService: SupplierService) {}

  /**
   * Public Api
   * getAllSupplierByShop()
   */
  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllSupplierByShop(
    @Body() filterSupplierDto: FilterAndPaginationSupplierDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.supplierService.getAllSupplierByShop(
      shop,
      filterSupplierDto,
      searchString,
    );
  }

  /**
   * ADD DATA
   * addSupplier()
   * insertManySupplier()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addSupplier(
    @Body()
    addSupplierDto: AddSupplierDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.supplierService.addSupplier(shop, addSupplierDto);
  }

  /**
   * GET DATA
   * getAllSuppliers()
   * getSupplierById()
   * getUserSupplierById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllSuppliers(
    @Body() filterSupplierDto: FilterAndPaginationSupplierDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.supplierService.getAllSuppliers(
      filterSupplierDto,
      searchString,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-supplier')
  async getSupplierByName(
    @Query('name') name: string,
  ): Promise<ResponsePayload> {
    return this.supplierService.getSupplierByName(name);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getSupplierById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.supplierService.getSupplierById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-supplier/:id')
  @UsePipes(ValidationPipe)
  async getUserSupplierById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.supplierService.getUserSupplierById(id, select);
  }

  /**
   * UPDATE DATA
   * updateSupplierById()
   * updateMultipleSupplierById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateSupplierById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ): Promise<ResponsePayload> {
    return await this.supplierService.updateSupplierById(id, updateSupplierDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleSupplierById(
    @Body() updateSupplierDto: UpdateSupplierDto,
  ): Promise<ResponsePayload> {
    return await this.supplierService.updateMultipleSupplierById(
      updateSupplierDto.ids,
      updateSupplierDto,
    );
  }

  /**
   * DELETE DATA
   * deleteSupplierById()
   * deleteMultipleSupplierById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteSupplierById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.supplierService.deleteSupplierById(
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
  async deleteMultipleSupplierById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.supplierService.deleteMultipleSupplierById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
