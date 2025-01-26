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

import { BuyBackService } from './buy-back.service';
import { AdminRolesGuard } from '../../guards/admin-roles.guard';
import { AdminRoles } from '../../enum/admin-roles.enum';
import { AdminMetaRoles } from '../../decorator/admin-roles.decorator';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import {
  AddBuyBackDto,
  FilterAndPaginationBuyBackDto,
  OptionBuyBackDto,
  UpdateBuyBackDto,
} from '../../dto/buy-back.dto';
import { AdminJwtAuthGuard } from '../../guards/admin-jwt-auth.guard';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';

@Controller('buyBack')
export class BuyBackController {
  private logger = new Logger(BuyBackController.name);

  constructor(private buyBackService: BuyBackService) {}


  /**
   * Public Api
   * getAllCategoryByShop()
   * getCategoryBySlug()
   * getCategoryByIds()
   */
  @Post('/get-all-by-shop')

  @UsePipes(ValidationPipe)
  async getAllCategoryByShop(
    @Body() filterCategoryDto: FilterAndPaginationBuyBackDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.buyBackService.getAllBuyBackByShop(
      shop,
      filterCategoryDto,
      searchString,
    );
  }
  /**
   * ADD DATA
   * addBuyBack()
   * insertManyBuyBack()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async addBuyBack(
    @Body()
    addBuyBackDto: AddBuyBackDto,
    // @GetAdmin() admin: Admin,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.buyBackService.addBuyBack(shop,addBuyBackDto);
  }

  @Post('/insert-many')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async insertManyBuyBack(
    @Body()
    body: {
      data: AddBuyBackDto[];
      option: OptionBuyBackDto;
    },
  ): Promise<ResponsePayload> {
    return await this.buyBackService.insertManyBuyBack(body.data);
  }

  /**
   * GET DATA
   * getAllBuyBacks()
   * getBuyBackById()
   * getUserBuyBackById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllBuyBacks(
    @Body() filterBuyBackDto: FilterAndPaginationBuyBackDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.buyBackService.getAllBuyBacks(filterBuyBackDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-buyBack')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getBuyBackByName(
    @Query('name') name: string,
  ): Promise<ResponsePayload> {
    return this.buyBackService.getBuyBackByName(name);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getBuyBackById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.buyBackService.getBuyBackById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-buyBack/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getUserBuyBackById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.buyBackService.getUserBuyBackById(id, select);
  }

  /**
   * UPDATE DATA
   * updateBuyBackById()
   * updateMultipleBuyBackById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateBuyBackById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateBuyBackDto: UpdateBuyBackDto,
  ): Promise<ResponsePayload> {
    return await this.buyBackService.updateBuyBackById(id, updateBuyBackDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleBuyBackById(
    @Body() updateBuyBackDto: UpdateBuyBackDto,
  ): Promise<ResponsePayload> {
    return await this.buyBackService.updateMultipleBuyBackById(
      updateBuyBackDto.ids,
      updateBuyBackDto,
    );
  }

  /**
   * DELETE DATA
   * deleteBuyBackById()
   * deleteMultipleBuyBackById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteBuyBackById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.buyBackService.deleteBuyBackById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleBuyBackById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.buyBackService.deleteMultipleBuyBackById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
