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
import { AdminJwtAuthGuard } from '../../../guards/admin-jwt-auth.guard';
import {
  AddSizeDto,
  FilterAndPaginationSizeDto,
  UpdateSizeDto,
} from '../../../dto/size.dto';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';
import { SizeService } from './size.service';

@Controller('size')
export class SizeController {
  private logger = new Logger(SizeController.name);

  constructor(private sizeService: SizeService) {}

  /**
   * Public Api
   * getAllSizeByShop()
   */
  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllSizeByShop(
    @Body() filterSizeDto: FilterAndPaginationSizeDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.sizeService.getAllSizeByShop(
      shop,
      filterSizeDto,
      searchString,
    );
  }

  /**
   * ADD DATA
   * addSize()
   * insertManySize()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addSize(
    @Body()
    addSizeDto: AddSizeDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.sizeService.addSize(shop, addSizeDto);
  }

  /**
   * GET DATA
   * getAllSize()
   * getSizeById()
   * getUserSizeById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllSize(
    @Body() filterSizeDto: FilterAndPaginationSizeDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.sizeService.getAllSize(filterSizeDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-size')
  async getSizeByName(@Query('name') name: string): Promise<ResponsePayload> {
    return this.sizeService.getSizeByName(name);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getSizeById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.sizeService.getSizeById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-size/:id')
  @UsePipes(ValidationPipe)
  async getUserSizeById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.sizeService.getUserSizeById(id, select);
  }

  /**
   * UPDATE DATA
   * updateSizeById()
   * updateMultipleSizeById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateSizeById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateSizeDto: UpdateSizeDto,
  ): Promise<ResponsePayload> {
    return await this.sizeService.updateSizeById(id, updateSizeDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleSizeById(
    @Body() updateSizeDto: UpdateSizeDto,
  ): Promise<ResponsePayload> {
    return await this.sizeService.updateMultipleSizeById(
      updateSizeDto.ids,
      updateSizeDto,
    );
  }

  /**
   * DELETE DATA
   * deleteSizeById()
   * deleteMultipleSizeById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteSizeById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.sizeService.deleteSizeById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleSizeById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.sizeService.deleteMultipleSizeById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
