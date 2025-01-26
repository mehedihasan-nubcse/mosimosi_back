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
  AddRepairDto,
  FilterAndPaginationRepairDto,
  UpdateRepairDto,
} from '../../dto/repair.dto';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';
import { RepairService } from './repair.service';

@Controller('repair')
export class RepairController {
  private logger = new Logger(RepairController.name);

  constructor(private repairService: RepairService) {}


  /**
   * Public Api
   * getAllRepairsByShop()
   */
  @Post('/get-all-by-shop')

  @UsePipes(ValidationPipe)
  async getAllRepairsByShop(
    @Body() filterRepairsDto: FilterAndPaginationRepairDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.repairService.getAllRepairByShop(
      shop,
      filterRepairsDto,
      searchString,
    );
  }



  /**
   * Repair Controller Methods
   * addRepair() -> /add
   * getAllRepairs() -> /get-all
   * getRepairById() -> /get-by-repair
   * getRepairByDate() -> /get-by-repair
   * getUserRepairById() -> /:id
   * updateRepairById() -> /update/:id
   * updateMultipleRepairById() ->  /update-multiple
   * deleteRepairById() -> /delete/:id
   * deleteMultipleRepairById() -> /delete-multiple
   */

  @Post('/add')
  @UsePipes(ValidationPipe)
  async addRepair(
    @Body()
    addRepairDto: AddRepairDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.repairService.addRepair( shop,addRepairDto);
  }
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllRepairs(
    @Body() filterRepairDto: FilterAndPaginationRepairDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.repairService.getAllRepairs(filterRepairDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-repair')
  async getRepairByDate(@Query('date') date: string): Promise<ResponsePayload> {
    return this.repairService.getRepairByDate(date);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getRepairById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.repairService.getRepairById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-repair/:id')
  @UsePipes(ValidationPipe)
  async getUserRepairById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.repairService.getUserRepairById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateRepairById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateRepairDto: UpdateRepairDto,
  ): Promise<ResponsePayload> {
    return await this.repairService.updateRepairById(id, updateRepairDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleRepairById(
    @Body() updateRepairDto: UpdateRepairDto,
  ): Promise<ResponsePayload> {
    return await this.repairService.updateMultipleRepairById(
      updateRepairDto.ids,
      updateRepairDto,
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
  async deleteRepairById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.repairService.deleteRepairById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleRepairById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.repairService.deleteMultipleRepairById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
