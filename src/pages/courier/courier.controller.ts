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
  AddCourierDto,
  FilterAndPaginationCourierDto,
  UpdateCourierDto,
} from '../../dto/courier.dto';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';
import { CourierService } from './courier.service';

@Controller('courier')
export class CourierController {
  private logger = new Logger(CourierController.name);

  constructor(private courierService: CourierService) {}

  /**
   * Public Api
   * getAllCourierByShop()
   */
  @Post('/get-all-by-shop')
 
  @UsePipes(ValidationPipe)
  async getAllCourierByShop(
    @Body() filterCourierDto: FilterAndPaginationCourierDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.courierService.getAllCourierByShop(
      shop,
      filterCourierDto,
      searchString,
    );
  }

  
  /**
   * Courier Controller Methods
   * addCourier() -> /add
   * getAllCouriers() -> /get-all
   * getCourierById() -> /get-by-courier
   * getCourierByDate() -> /get-by-courier
   * getUserCourierById() -> /:id
   * updateCourierById() -> /update/:id
   * updateMultipleCourierById() ->  /update-multiple
   * deleteCourierById() -> /delete/:id
   * deleteMultipleCourierById() -> /delete-multiple
   */

  @Post('/add')
  @UsePipes(ValidationPipe)
  async addCourier(
    @Body()
    addCourierDto: AddCourierDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.courierService.addCourier(shop, addCourierDto);
  }
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllCouriers(
    @Body() filterCourierDto: FilterAndPaginationCourierDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.courierService.getAllCouriers(filterCourierDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-courier')
  async getCourierByDate(
    @Query('date') date: string,
  ): Promise<ResponsePayload> {
    return this.courierService.getCourierByDate(date);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getCourierById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.courierService.getCourierById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-courier/:id')
  @UsePipes(ValidationPipe)
  async getUserCourierById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.courierService.getUserCourierById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateCourierById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateCourierDto: UpdateCourierDto,
  ): Promise<ResponsePayload> {
    return await this.courierService.updateCourierById(id, updateCourierDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleCourierById(
    @Body() updateCourierDto: UpdateCourierDto,
  ): Promise<ResponsePayload> {
    return await this.courierService.updateMultipleCourierById(
      updateCourierDto.ids,
      updateCourierDto,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteCourierById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.courierService.deleteCourierById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleCourierById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.courierService.deleteMultipleCourierById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
