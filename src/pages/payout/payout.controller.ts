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
import { User } from '../../interfaces/user/user.interface';
import { GetTokenUser } from '../../decorator/get-token-user.decorator';
import { AdminPermissions } from '../../enum/admin-permission.enum';
import { AdminRolesGuard } from '../../guards/admin-roles.guard';
import { AdminPermissionGuard } from '../../guards/admin-permission.guard';
import { PayoutService } from './payout.service';
import { AdminRoles } from '../../enum/admin-roles.enum';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { AdminMetaRoles } from '../../decorator/admin-roles.decorator';
import { AdminJwtAuthGuard } from '../../guards/admin-jwt-auth.guard';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';
import { AdminMetaPermissions } from '../../decorator/admin-permissions.decorator';
import { UserJwtAuthGuard } from '../../guards/user-jwt-auth.guard';
import {
  AddPayoutDto,
  CheckPayoutDto,
  FilterAndPaginationPayoutDto,
  OptionPayoutDto,
  UpdatePayoutDto,
} from '../../dto/payout.dto';

@Controller('payout')
export class PayoutController {
  private logger = new Logger(PayoutController.name);

  constructor(private payoutService: PayoutService) {}

  /**
   * Public Api
   * getAllPayoutByShop()
   */
  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllPayoutByShop(
    @Body() filterPayoutDto: FilterAndPaginationPayoutDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.payoutService.getAllPayoutByShop(
      shop,
      filterPayoutDto,
      searchString,
    );
  }

  /**
   * addPayout
   * insertManyPayout
   */
  @Post('/add')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.CREATE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async addPayout(
    @Body()
    addPayoutDto: AddPayoutDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.payoutService.addPayout(shop, addPayoutDto);
  }

  @Post('/insert-many')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async insertManyPayout(
    @Body()
    body: {
      data: AddPayoutDto[];
      option: OptionPayoutDto;
    },
  ): Promise<ResponsePayload> {
    return await this.payoutService.insertManyPayout(body.data, body.option);
  }

  /**
   * getAllPayouts
   * getPayoutById
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllPayouts(
    @Body() filterPayoutDto: FilterAndPaginationPayoutDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.payoutService.getAllPayouts(filterPayoutDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get')
  async getShopInformation(@Query() select: string): Promise<ResponsePayload> {
    return await this.payoutService.getPayout(select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-all-basic')
  async getAllPayoutsBasic(): Promise<ResponsePayload> {
    return await this.payoutService.getAllPayoutsBasic();
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  async getPayoutById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.payoutService.getPayoutById(id, select);
  }

  /**
   * updatePayoutById
   * updateMultiplePayoutById
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updatePayoutById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updatePayoutDto: UpdatePayoutDto,
  ): Promise<ResponsePayload> {
    return await this.payoutService.updatePayoutById(id, updatePayoutDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultiplePayoutById(
    @Body() updatePayoutDto: UpdatePayoutDto,
  ): Promise<ResponsePayload> {
    return await this.payoutService.updateMultiplePayoutById(
      updatePayoutDto.ids,
      updatePayoutDto,
    );
  }

  /**
   * deletePayoutById
   * deleteMultiplePayoutById
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deletePayoutById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.payoutService.deletePayoutById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultiplePayoutById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.payoutService.deleteMultiplePayoutById(
      data.ids,
      Boolean(checkUsage),
    );
  }

  @Post('/check-contact-availability')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async checkPayoutAvailability(
    @GetTokenUser() user: User,
    @Body() checkPayoutDto: CheckPayoutDto,
  ): Promise<ResponsePayload> {
    return await this.payoutService.checkPayoutAvailability(
      user,
      checkPayoutDto,
    );
  }
}
