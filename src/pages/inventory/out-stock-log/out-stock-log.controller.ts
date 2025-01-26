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
  Req,
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
import { OutStockLogService } from './out-stock-log.service';
import {
  AddColorDto,
  FilterAndPaginationColorDto,
} from '../../../dto/color.dto';
import {
  AddOutStockLogDto,
  FilterAndPaginationOutStockLogDto,
  UpdateOutStockLogDto,
} from '../../../dto/out-stock-log.dto';

@Controller('outStockLog')
export class OutStockLogController {
  private logger = new Logger(OutStockLogController.name);

  constructor(private outStockLogService: OutStockLogService) {}

  /**
   * ADD DATA
   * addOutStockLog()
   * insertManyOutStockLog()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addOutStockLog(
    @Body()
    addOutStockLogDto: AddOutStockLogDto,
  ): Promise<ResponsePayload> {
    return await this.outStockLogService.addOutStockLog(addOutStockLogDto);
  }

  @Post('/add-by-shop')
  @UsePipes(ValidationPipe)
  async addOutStockLogByShop(
    @Body()
    addColorDto: AddColorDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.outStockLogService.addOutStockLogByShop(
      shop,
      addColorDto,
    );
  }

  /**
   * GET DATA
   * getAllOutStockLogs()
   * getOutStockLogById()
   * getUserOutStockLogById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllOutStockLogs(
    @Body() filterOutStockLogDto: FilterAndPaginationOutStockLogDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.outStockLogService.getAllOutStockLogs(
      filterOutStockLogDto,
      searchString,
    );
  }

  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllOutStockLogByShop(
    @Body() filterColorDto: FilterAndPaginationColorDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.outStockLogService.getAllOutStockLogByShop(
      shop,
      filterColorDto,
      searchString,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-outStockLog')
  async getOutStockLogByName(
    @Query('name') name: string,
  ): Promise<ResponsePayload> {
    return this.outStockLogService.getOutStockLogByName(name);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getOutStockLogById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.outStockLogService.getOutStockLogById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-outStockLog/:id')
  @UsePipes(ValidationPipe)
  async getUserOutStockLogById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.outStockLogService.getUserOutStockLogById(id, select);
  }

  /**
   * UPDATE DATA
   * updateOutStockLogById()
   * updateMultipleOutStockLogById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateOutStockLogById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateOutStockLogDto: UpdateOutStockLogDto,
  ): Promise<ResponsePayload> {
    return await this.outStockLogService.updateOutStockLogById(
      id,
      updateOutStockLogDto,
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
  async updateMultipleOutStockLogById(
    @Body() updateOutStockLogDto: UpdateOutStockLogDto,
  ): Promise<ResponsePayload> {
    return await this.outStockLogService.updateMultipleOutStockLogById(
      updateOutStockLogDto.ids,
      updateOutStockLogDto,
    );
  }

  /**
   * DELETE DATA
   * deleteOutStockLogById()
   * deleteMultipleOutStockLogById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteOutStockLogById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.outStockLogService.deleteOutStockLogById(
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
  async deleteMultipleOutStockLogById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
    @Req() req: any,
  ): Promise<ResponsePayload> {
    return await this.outStockLogService.deleteMultipleOutStockLogById(
      req.user,
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
    return await this.outStockLogService.restoreMultipleProductLogById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
