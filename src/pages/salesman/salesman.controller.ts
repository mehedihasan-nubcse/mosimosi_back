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
import {
  AdminSelectFieldDto,
  AuthAdminDto,
  CreateAdminDto,
  FilterAndPaginationAdminDto,
  UpdateAdminDto,
} from '../../dto/admin.dto';
import {
  Admin,
  AdminAuthResponse,
} from '../../interfaces/admin/admin.interface';
import { AuthGuard } from '@nestjs/passport';
import { GetAdmin } from '../../decorator/get-admin.decorator';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { AdminMetaPermissions } from '../../decorator/admin-permissions.decorator';
import { AdminPermissions } from '../../enum/admin-permission.enum';
import { AdminPermissionGuard } from '../../guards/admin-permission.guard';
import { PASSPORT_ADMIN_TOKEN_TYPE } from '../../core/global-variables';
import { AdminMetaRoles } from '../../decorator/admin-roles.decorator';
import { AdminRoles } from '../../enum/admin-roles.enum';
import { AdminRolesGuard } from '../../guards/admin-roles.guard';
import { AdminJwtAuthGuard } from '../../guards/admin-jwt-auth.guard';
import { ChangePasswordDto } from '../../dto/change-password.dto';
import { SalesmanService } from './salesman.service';

@Controller('salesman')
export class SalesmanController {
  private logger = new Logger(SalesmanController.name);

  constructor(private salesmanService: SalesmanService) {}

  /**
   * Admin Signup
   * Admin Login
   */

  @Post('/signup')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SALESMAN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async adminSignup(
    @Body()
    createAdminDto: CreateAdminDto,
  ): Promise<ResponsePayload> {
    return await this.salesmanService.salesmanSignup(createAdminDto);
  }

  @Post('/login')
  @UsePipes(ValidationPipe)
  async adminLogin(
    @Body() authAdminDto: AuthAdminDto,
  ): Promise<AdminAuthResponse> {
    return await this.salesmanService.salesmanLogin(authAdminDto);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/logged-in-salesman-data')
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async getLoggedInAdminData(
    @Query(ValidationPipe) adminSelectFieldDto: AdminSelectFieldDto,
    @GetAdmin() admin: Admin,
  ): Promise<ResponsePayload> {
    return this.salesmanService.getLoggedInSalesmanData(
      admin,
      adminSelectFieldDto,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Post('/all-salesmans')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getAllAdmins(
    @Body() filterAdminDto: FilterAndPaginationAdminDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.salesmanService.getAllSalesmans(filterAdminDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/salesmans-by-search')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getAdminsBySearch(
    @Query('q') searchString: string,
    @Query(ValidationPipe) adminSelectFieldDto: AdminSelectFieldDto,
  ): Promise<Admin[]> {
    return this.salesmanService.getSalesmanBySearch(
      searchString,
      adminSelectFieldDto,
    );
  }

  /**
   * Get salesman by ID
   * Update Logged In salesman Info
   * Change Logged In salesman Password
   * Update salesman by Id
   * Update Multiple salesman By Id
   * Delete salesman by Id
   * Delete Multiple salesman By Id
   */

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getAdminById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query(ValidationPipe) adminSelectFieldDto: AdminSelectFieldDto,
  ): Promise<ResponsePayload> {
    return await this.salesmanService.getSalesmanById(id, adminSelectFieldDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-logged-in-salesman')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async updateLoggedInAdminInfo(
    @GetAdmin() admin: Admin,
    @Body() updateAdminDto: UpdateAdminDto,
  ): Promise<ResponsePayload> {
    return await this.salesmanService.updateLoggedInSalesmanInfo(
      admin,
      updateAdminDto,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Put('/change-logged-in-salesman-password')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async changeLoggedInAdminPassword(
    @GetAdmin() admin: Admin,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<ResponsePayload> {
    return await this.salesmanService.changeLoggedInSalesmanPassword(
      admin,
      changePasswordDto,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-salesman/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateAdminById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ): Promise<ResponsePayload> {
    return await this.salesmanService.updateSalesmanById(id, updateAdminDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple-salesman-by-id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleAdminById(
    @Body() updateAdminDto: UpdateAdminDto,
  ): Promise<ResponsePayload> {
    return await this.salesmanService.updateMultipleSalesmanById(
      updateAdminDto.ids,
      updateAdminDto,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Delete('/delete-salesman/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteAdminById(
    @Param('id', MongoIdValidationPipe) id: string,
  ): Promise<ResponsePayload> {
    return await this.salesmanService.deleteSalesmanById(id);
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple-salesman-by-id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleAdminById(
    @Body() data: { ids: string[] },
  ): Promise<ResponsePayload> {
    return await this.salesmanService.deleteMultipleSalesmanById(data.ids);
  }
}
