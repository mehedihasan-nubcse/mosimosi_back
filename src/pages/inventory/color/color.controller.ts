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
  AddColorDto,
  FilterAndPaginationColorDto,
  OptionColorDto,
  UpdateColorDto,
} from '../../../dto/color.dto';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';
import { ColorService } from './color.service';

@Controller('color')
export class ColorController {
  private logger = new Logger(ColorController.name);

  constructor(private colorService: ColorService) {}

  /**
   * Public Api
   * getAllColorByShop()
   */
  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllColorByShop(
    @Body() filterColorDto: FilterAndPaginationColorDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.colorService.getAllColorByShop(
      shop,
      filterColorDto,
      searchString,
    );
  }

  /**
   * ADD DATA
   * addColor()
   * insertManyColor()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addColor(
    @Body()
    addColorDto: AddColorDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.colorService.addColor(shop, addColorDto);
  }

  /**
   * GET DATA
   * getAllColor()
   * getColorById()
   * getUserColorById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllColor(
    @Body() filterColorDto: FilterAndPaginationColorDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.colorService.getAllColor(filterColorDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-color')
  async getColorByName(@Query('name') name: string): Promise<ResponsePayload> {
    return this.colorService.getColorByName(name);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getColorById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.colorService.getColorById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-color/:id')
  @UsePipes(ValidationPipe)
  async getUserColorById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.colorService.getUserColorById(id, select);
  }

  /**
   * UPDATE DATA
   * updateColorById()
   * updateMultipleColorById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateColorById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateColorDto: UpdateColorDto,
  ): Promise<ResponsePayload> {
    return await this.colorService.updateColorById(id, updateColorDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleColorById(
    @Body() updateColorDto: UpdateColorDto,
  ): Promise<ResponsePayload> {
    return await this.colorService.updateMultipleColorById(
      updateColorDto.ids,
      updateColorDto,
    );
  }

  /**
   * DELETE DATA
   * deleteColorById()
   * deleteMultipleColorById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteColorById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.colorService.deleteColorById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleColorById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.colorService.deleteMultipleColorById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
