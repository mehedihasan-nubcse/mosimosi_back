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
  AddExpenseDto,
  FilterAndPaginationExpenseDto,
  UpdateExpenseDto,
} from '../../dto/expense.dto';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';
import { ExpenseService } from './expense.service';



@Controller('expense')
export class ExpenseController {
  private logger = new Logger(ExpenseController.name);

  constructor(private expenseService: ExpenseService) {}

  /**
   * Public Api
   * getAllExpensesByShop()
   */
  @Post('/get-all-by-shop')

  @UsePipes(ValidationPipe)
  async getAllExpensesByShop(
    @Body() filterExpensesDto: FilterAndPaginationExpenseDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.expenseService.getAllExpenseByShop(
      shop,
      filterExpensesDto,
      searchString,
    );
  }


  
  /**
   * Expense Controller Methods
   * addExpense() -> /add
   * getAllExpenses() -> /get-all
   * getExpenseById() -> /get-by-expense
   * getExpenseByDate() -> /get-by-expense
   * getUserExpenseById() -> /:id
   * updateExpenseById() -> /update/:id
   * updateMultipleExpenseById() ->  /update-multiple
   * deleteExpenseById() -> /delete/:id
   * deleteMultipleExpenseById() -> /delete-multiple
   */

  @Post('/add')
  @UsePipes(ValidationPipe)
  async addExpense(
    @Body()
    addExpenseDto: AddExpenseDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.expenseService.addExpense(
      shop,addExpenseDto);
  }
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllExpenses(
    @Body() filterExpenseDto: FilterAndPaginationExpenseDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.expenseService.getAllExpenses(filterExpenseDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-expense')
  async getExpenseByDate(
    @Query('date') date: string,
  ): Promise<ResponsePayload> {
    return this.expenseService.getExpenseByDate(date);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getExpenseById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.expenseService.getExpenseById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-expense/:id')
  @UsePipes(ValidationPipe)
  async getUserExpenseById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.expenseService.getUserExpenseById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateExpenseById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ): Promise<ResponsePayload> {
    return await this.expenseService.updateExpenseById(id, updateExpenseDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleExpenseById(
    @Body() updateExpenseDto: UpdateExpenseDto,
  ): Promise<ResponsePayload> {
    return await this.expenseService.updateMultipleExpenseById(
      updateExpenseDto.ids,
      updateExpenseDto,
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
  async deleteExpenseById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.expenseService.deleteExpenseById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleExpenseById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.expenseService.deleteMultipleExpenseById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
