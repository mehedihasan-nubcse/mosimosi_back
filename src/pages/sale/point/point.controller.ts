import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
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
  AddPointDto,
  FilterAndPaginationPointDto,
} from '../../../dto/point.dto';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { PointService } from './point.service';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';

@Controller('point')
export class PointController {
  private logger = new Logger(PointController.name);

  constructor(private pointService: PointService) {}

  /**
   * Public Api
   * getAllPointByShop()
   */
  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllPointByShop(
    @Body() filterPointDto: FilterAndPaginationPointDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.pointService.getAllPointByShop(
      shop,
      filterPointDto,
      searchString,
    );
  }

  /**
   * addPoint
   * insertManyPoint
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async addPoint(
    @Body()
    addPointDto: AddPointDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.pointService.addPoint(shop, addPointDto);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get')
  async getPoint(
    @Query() select: string,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.pointService.getPoint(shop,select);
  }
}
