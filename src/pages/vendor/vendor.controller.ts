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
  AddVendorDto,
  FilterAndPaginationVendorDto,
  OptionVendorDto,
  UpdateVendorDto,
} from '../../dto/vendor.dto';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';
import { VendorService } from './vendor.service';


@Controller('vendor')
export class VendorController {
  private logger = new Logger(VendorController.name);

  constructor(private vendorService: VendorService) {}


  /**
   * Public Api
   * getAllVendorByShop()
   */
  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllVendorByShop(
    @Body() filterVendorDto: FilterAndPaginationVendorDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.vendorService.getAllVendorByShop(
      shop,
      filterVendorDto,
      searchString,
    );
  }

  
  
  /**
   * ADD DATA
   * addVendor()
   * insertManyVendor()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addVendor(
    @Body()
    addVendorDto: AddVendorDto,
    @Query('shop', MongoIdValidationPipe) shop: string,

  ): Promise<ResponsePayload> {
    return await this.vendorService.addVendor( shop,addVendorDto);
  }

  /**
   * GET DATA
   * getAllVendors()
   * getVendorById()
   * getUserVendorById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllVendors(
    @Body() filterVendorDto: FilterAndPaginationVendorDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.vendorService.getAllVendors(filterVendorDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-vendor')
  async getVendorByName(@Query('name') name: string): Promise<ResponsePayload> {
    return this.vendorService.getVendorByName(name);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getVendorById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.vendorService.getVendorById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-vendor/:id')
  @UsePipes(ValidationPipe)
  async getUserVendorById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.vendorService.getUserVendorById(id, select);
  }

  /**
   * UPDATE DATA
   * updateVendorById()
   * updateMultipleVendorById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateVendorById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ): Promise<ResponsePayload> {
    return await this.vendorService.updateVendorById(id, updateVendorDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleVendorById(
    @Body() updateVendorDto: UpdateVendorDto,
  ): Promise<ResponsePayload> {
    return await this.vendorService.updateMultipleVendorById(
      updateVendorDto.ids,
      updateVendorDto,
    );
  }

  /**
   * DELETE DATA
   * deleteVendorById()
   * deleteMultipleVendorById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteVendorById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.vendorService.deleteVendorById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleVendorById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.vendorService.deleteMultipleVendorById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
