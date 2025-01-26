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
  AddAttributeDto,
  FilterAndPaginationAttributeDto,
  OptionAttributeDto,
  UpdateAttributeDto,
} from '../../../dto/attribute.dto';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';
import { AttributeService } from './attribute.service';

@Controller('attribute')
export class AttributeController {
  private logger = new Logger(AttributeController.name);

  constructor(private attributeService: AttributeService) {}

  /**
   * Public Api
   * getAllAttributeByShop()
   */
  @Post('/get-all-by-shop')

  @UsePipes(ValidationPipe)
  async getAllAttributeByShop(
    @Body() filterAttributeDto: FilterAndPaginationAttributeDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.attributeService.getAllAttributeByShop(
      shop,
      filterAttributeDto,
      searchString,
    );
  }

  
  /**
   * ADD DATA
   * addAttribute()
   * insertManyAttribute()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addAttribute(
    @Body()
    addAttributeDto: AddAttributeDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.attributeService.addAttribute(shop, addAttributeDto);
  }

  /**
   * GET DATA
   * getAllAttribute()
   * getAttributeById()
   * getUserAttributeById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllAttribute(
    @Body() filterAttributeDto: FilterAndPaginationAttributeDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.attributeService.getAllAttribute(
      filterAttributeDto,
      searchString,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-attribute')
  async getAttributeByName(
    @Query('name') name: string,
  ): Promise<ResponsePayload> {
    return this.attributeService.getAttributeByName(name);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getAttributeById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.attributeService.getAttributeById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-attribute/:id')
  @UsePipes(ValidationPipe)
  async getUserAttributeById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.attributeService.getUserAttributeById(id, select);
  }

  /**
   * UPDATE DATA
   * updateAttributeById()
   * updateMultipleAttributeById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateAttributeById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ): Promise<ResponsePayload> {
    return await this.attributeService.updateAttributeById(
      id,
      updateAttributeDto,
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
  async updateMultipleAttributeById(
    @Body() updateAttributeDto: UpdateAttributeDto,
  ): Promise<ResponsePayload> {
    return await this.attributeService.updateMultipleAttributeById(
      updateAttributeDto.ids,
      updateAttributeDto,
    );
  }

  /**
   * DELETE DATA
   * deleteAttributeById()
   * deleteMultipleAttributeById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteAttributeById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.attributeService.deleteAttributeById(
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
  async deleteMultipleAttributeById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.attributeService.deleteMultipleAttributeById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
