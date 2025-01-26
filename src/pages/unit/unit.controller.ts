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
  AddUnitDto,
  FilterAndPaginationUnitDto,
  OptionUnitDto,
  UpdateUnitDto,
} from '../../dto/unit.dto';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';
import { UnitService } from './unit.service';

@Controller('unit')
export class UnitController {
  private logger = new Logger(UnitController.name);

  constructor(private unitService: UnitService) {}

  /**
   * Public Api
   * getAllUnitByShop()
   */
  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllUnitByShop(
    @Body() filterUnitDto: FilterAndPaginationUnitDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.unitService.getAllUnitByShop(
      shop,
      filterUnitDto,
      searchString,
    );
  }

  /**
   * ADD DATA
   * addUnit()
   * insertManyUnit()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addUnit(
    @Body()
    addUnitDto: AddUnitDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.unitService.addUnit(shop, addUnitDto);
  }

  /**
   * GET DATA
   * getAllUnits()
   * getUnitById()
   * getUserUnitById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllUnits(
    @Body() filterUnitDto: FilterAndPaginationUnitDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.unitService.getAllUnits(filterUnitDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-unit')
  async getUnitByName(@Query('name') name: string): Promise<ResponsePayload> {
    return this.unitService.getUnitByName(name);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getUnitById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.unitService.getUnitById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-unit/:id')
  @UsePipes(ValidationPipe)
  async getUserUnitById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.unitService.getUserUnitById(id, select);
  }

  /**
   * UPDATE DATA
   * updateUnitById()
   * updateMultipleUnitById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateUnitById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateUnitDto: UpdateUnitDto,
  ): Promise<ResponsePayload> {
    return await this.unitService.updateUnitById(id, updateUnitDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleUnitById(
    @Body() updateUnitDto: UpdateUnitDto,
  ): Promise<ResponsePayload> {
    return await this.unitService.updateMultipleUnitById(
      updateUnitDto.ids,
      updateUnitDto,
    );
  }

  /**
   * DELETE DATA
   * deleteUnitById()
   * deleteMultipleUnitById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteUnitById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.unitService.deleteUnitById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleUnitById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.unitService.deleteMultipleUnitById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
