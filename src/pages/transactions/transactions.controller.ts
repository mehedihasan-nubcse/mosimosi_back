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
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';
import { TransactionsService } from './transactions.service';
import {
  AddTransactionsDto,
  FilterAndPaginationTransactionsDto,
  UpdateTransactionsDto,
} from 'src/dto/transactions.dto';
import { GetAdmin } from 'src/decorator/get-admin.decorator';
import { Admin } from 'src/interfaces/admin/admin.interface';
import { PASSPORT_ADMIN_TOKEN_TYPE } from 'src/core/global-variables';
import { AuthGuard } from '@nestjs/passport';

@Controller('transactions')
export class TransactionsController {
  private logger = new Logger(TransactionsController.name);

  constructor(private transactionsService: TransactionsService) {}



  /**
   * Public Api
   * getAllTransactionsByShop()
   */
  @Post('/get-all-by-shop')

  @UsePipes(ValidationPipe)
  async getAllTransactionsByShop(
    @Body() filterTransactionsDto: FilterAndPaginationTransactionsDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.transactionsService.getAllTransactionsByShop(
      shop,
      filterTransactionsDto,
      searchString,
    );
  }



  /**
   * ADD DATA
   * addTransactions()
   * insertManyTransactions()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async addTransactions(
    @Body()
    addTransactionseDto: AddTransactionsDto,
    @GetAdmin() admin: Admin,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.transactionsService.addTransactions(
      shop,
      addTransactionseDto,
      admin,
    );
  }

  /**
   * GET DATA
   * getAllTransactionss()
   * getTransactionsById()
   * getUserTransactionsById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllTransactionss(
    @Body() filterTransactionsDto: FilterAndPaginationTransactionsDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.transactionsService.getAllTransactionss(
      filterTransactionsDto,
      searchString,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-transactions')
  async getTransactionsByDate(
    @Query('date') date: string,
  ): Promise<ResponsePayload> {
    return this.transactionsService.getTransactionsByDate(date);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getTransactionsById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.transactionsService.getTransactionsById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-transactions/:id')
  @UsePipes(ValidationPipe)
  async getUserTransactionsById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.transactionsService.getUserTransactionsById(id, select);
  }

  /**
   * UPDATE DATA
   * updateTransactionsById()
   * updateMultipleTransactionsById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateTransactionsById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateTransactionsDto: UpdateTransactionsDto,
  ): Promise<ResponsePayload> {
    return await this.transactionsService.updateTransactionsById(
      id,
      updateTransactionsDto,
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
  async updateMultipleTransactionsById(
    @Body() updateTransactionsDto: UpdateTransactionsDto,
  ): Promise<ResponsePayload> {
    return await this.transactionsService.updateMultipleTransactionsById(
      updateTransactionsDto.ids,
      updateTransactionsDto,
    );
  }

  /**
   * DELETE DATA
   * deleteTransactionsById()
   * deleteMultipleTransactionsById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteTransactionsById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.transactionsService.deleteTransactionsById(
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
  async deleteMultipleTransactionsById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.transactionsService.deleteMultipleTransactionsById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
