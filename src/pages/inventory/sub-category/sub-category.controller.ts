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
  AddSubCategoryDto,
  FilterAndPaginationSubCategoryDto,
  OptionSubCategoryDto,
  UpdateSubCategoryDto,
} from '../../../dto/sub-category.dto';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';
import { SubCategoryService } from './sub-category.service';

@Controller('sub-category')
export class SubCategoryController {
  private logger = new Logger(SubCategoryController.name);

  constructor(private SubCategoryService: SubCategoryService) {}

  /**
   * Public Api
   * getAllSubCategoryByShop()
   */
  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllSubCategoryByShop(
    @Body() filterSubCategoryDto: FilterAndPaginationSubCategoryDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.SubCategoryService.getAllSubCategoryByShop(
      shop,
      filterSubCategoryDto,
      searchString,
    );
  }

  /**
   * ADD DATA
   * addSubCategory()
   * insertManySubCategory()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addSubCategory(
    @Body()
    addSubCategoryDto: AddSubCategoryDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.SubCategoryService.addSubCategory(
      shop,
      addSubCategoryDto,
    );
  }

  /**
   * GET DATA
   * getAllSubCategory()
   * getSubCategoryById()
   * getUserSubCategoryById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllSubCategory(
    @Body() filterSubCategoryDto: FilterAndPaginationSubCategoryDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.SubCategoryService.getAllSubCategory(
      filterSubCategoryDto,
      searchString,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-sub-category')
  async getSubCategoryByName(
    @Query('name') name: string,
  ): Promise<ResponsePayload> {
    return this.SubCategoryService.getSubCategoryByName(name);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getSubCategoryById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.SubCategoryService.getSubCategoryById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-sub-category/:id')
  @UsePipes(ValidationPipe)
  async getUserSubCategoryById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.SubCategoryService.getUserSubCategoryById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-all-by-parent/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getSubCategoriesByCategoryId(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('select') select: string,
  ): Promise<ResponsePayload> {
    return await this.SubCategoryService.getSubCategoriesByCategoryId(
      id,
      select,
    );
  }

  /**
   * UPDATE DATA
   * updateSubCategoryById()
   * updateMultipleSubCategoryById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateSubCategoryById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<ResponsePayload> {
    return await this.SubCategoryService.updateSubCategoryById(
      id,
      updateSubCategoryDto,
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
  async updateMultipleSubCategoryById(
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<ResponsePayload> {
    return await this.SubCategoryService.updateMultipleSubCategoryById(
      updateSubCategoryDto.ids,
      updateSubCategoryDto,
    );
  }

  /**
   * DELETE DATA
   * deleteSubCategoryById()
   * deleteMultipleSubCategoryById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteSubCategoryById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.SubCategoryService.deleteSubCategoryById(
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
  async deleteMultipleSubCategoryById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.SubCategoryService.deleteMultipleSubCategoryById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
