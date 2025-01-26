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
  AddRegistrationDto,
  FilterAndPaginationRegistrationDto,
  OptionRegistrationDto,
  UpdateRegistrationDto,
} from '../../dto/registration.dto';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';
import { RegistrationService } from './registration.service';

@Controller('registration')
export class RegistrationController {
  private logger = new Logger(RegistrationController.name);

  constructor(private registrationService: RegistrationService) {}

  /**
   * addRegistration
   * insertManyRegistration
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addRegistration(
    @Body()
    addRegistrationDto: AddRegistrationDto,
  ): Promise<ResponsePayload> {
    return await this.registrationService.addRegistration(addRegistrationDto);
  }

  /**
   * getAllRegistrations
   * getRegistrationById
   * getUserRegistrationById
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllRegistrations(
    @Body() filterRegistrationDto: FilterAndPaginationRegistrationDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.registrationService.getAllRegistrations(
      filterRegistrationDto,
      searchString,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getRegistrationById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.registrationService.getRegistrationById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-registration/:id')
  @UsePipes(ValidationPipe)
  async getUserRegistrationById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.registrationService.getUserRegistrationById(id, select);
  }

  /**
   * updateRegistrationById
   * updateMultipleRegistrationById
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateRegistrationById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateRegistrationDto: UpdateRegistrationDto,
  ): Promise<ResponsePayload> {
    return await this.registrationService.updateRegistrationById(
      id,
      updateRegistrationDto,
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
  async updateMultipleRegistrationById(
    @Body() updateRegistrationDto: UpdateRegistrationDto,
  ): Promise<ResponsePayload> {
    return await this.registrationService.updateMultipleRegistrationById(
      updateRegistrationDto.ids,
      updateRegistrationDto,
    );
  }

  /**
   * deleteRegistrationById
   * deleteMultipleRegistrationById
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteRegistrationById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.registrationService.deleteRegistrationById(
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
  async deleteMultipleRegistrationById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.registrationService.deleteMultipleRegistrationById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
