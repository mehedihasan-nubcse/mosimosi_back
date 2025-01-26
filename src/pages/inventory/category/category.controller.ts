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
  AddCategoryDto,
  FilterAndPaginationCategoryDto,
  OptionCategoryDto,
  UpdateCategoryDto,
} from '../../../dto/category.dto';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
  private logger = new Logger(CategoryController.name);

  constructor(private categoryService: CategoryService) {}

  /**
   * Public Api
   * getAllCategoryByShop()
   */
  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllCategoryByShop(
    @Body() filterCategoryDto: FilterAndPaginationCategoryDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.categoryService.getAllCategoryByShop(
      shop,
      filterCategoryDto,
      searchString,
    );
  }

  /**
   * ADD DATA
   * addCategory()
   * insertManyCategory()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addCategory(
    @Body()
    addCategoryDto: AddCategoryDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.categoryService.addCategory(shop, addCategoryDto);
  }

  /**
   * GET DATA
   * getAllCategory()
   * getCategoryById()
   * getUserCategoryById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllCategory(
    @Body() filterCategoryDto: FilterAndPaginationCategoryDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.categoryService.getAllCategory(filterCategoryDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-category')
  async getCategoryByName(
    @Query('name') name: string,
  ): Promise<ResponsePayload> {
    return this.categoryService.getCategoryByName(name);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getCategoryById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.categoryService.getCategoryById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-category/:id')
  @UsePipes(ValidationPipe)
  async getUserCategoryById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.categoryService.getUserCategoryById(id, select);
  }

  /**
   * UPDATE DATA
   * updateCategoryById()
   * updateMultipleCategoryById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateCategoryById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ResponsePayload> {
    return await this.categoryService.updateCategoryById(id, updateCategoryDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleCategoryById(
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ResponsePayload> {
    return await this.categoryService.updateMultipleCategoryById(
      updateCategoryDto.ids,
      updateCategoryDto,
    );
  }

  /**
   * DELETE DATA
   * deleteCategoryById()
   * deleteMultipleCategoryById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteCategoryById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.categoryService.deleteCategoryById(
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
  async deleteMultipleCategoryById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.categoryService.deleteMultipleCategoryById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
