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
  AddIncomeDto,
  FilterAndPaginationIncomeDto,
  OptionIncomeDto,
  UpdateIncomeDto,
} from '../../dto/income.dto';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';
import { IncomeService } from './income.service';

@Controller('income')
export class IncomeController {
  private logger = new Logger(IncomeController.name);

  constructor(private incomeService: IncomeService) {}


  /**
   * Public Api
   * getAllIncomeByShop()
   */
  @Post('/get-all-by-shop')

  @UsePipes(ValidationPipe)
  async getAllIncomeByShop(
    @Body() filterIncomeDto: FilterAndPaginationIncomeDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.incomeService.getAllIncomeByShop(
      shop,
      filterIncomeDto,
      searchString,
    );
  }




  
  /**
   * Income Controller Methods
   * addIncome() -> /add
   * getAllIncomes() -> /get-all
   * getIncomeById() -> /get-by-income
   * getIncomeByDate() -> /get-by-income
   * getUserIncomeById() -> /:id
   * updateIncomeById() -> /update/:id
   * updateMultipleIncomeById() ->  /update-multiple
   * deleteIncomeById() -> /delete/:id
   * deleteMultipleIncomeById() -> /delete-multiple
   */

  @Post('/add')
  @UsePipes(ValidationPipe)
  async addIncome(
    @Body()
    addIncomeDto: AddIncomeDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.incomeService.addIncome(shop, addIncomeDto);
  }
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllIncomes(
    @Body() filterIncomeDto: FilterAndPaginationIncomeDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.incomeService.getAllIncomes(filterIncomeDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-income')
  async getIncomeByDate(@Query('date') date: string): Promise<ResponsePayload> {
    return this.incomeService.getIncomeByDate(date);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getIncomeById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.incomeService.getIncomeById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-income/:id')
  @UsePipes(ValidationPipe)
  async getUserIncomeById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.incomeService.getUserIncomeById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateIncomeById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateIncomeDto: UpdateIncomeDto,
  ): Promise<ResponsePayload> {
    return await this.incomeService.updateIncomeById(id, updateIncomeDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleIncomeById(
    @Body() updateIncomeDto: UpdateIncomeDto,
  ): Promise<ResponsePayload> {
    return await this.incomeService.updateMultipleIncomeById(
      updateIncomeDto.ids,
      updateIncomeDto,
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
  async deleteIncomeById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.incomeService.deleteIncomeById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleIncomeById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.incomeService.deleteMultipleIncomeById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
