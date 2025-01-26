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
import { PatternService } from './pattern.service';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { AddColorDto, FilterAndPaginationColorDto } from '../../dto/color.dto';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';
import {
  AddPatternDto,
  FilterAndPaginationPatternDto,
  UpdatePatternDto,
} from '../../dto/pattern.dto';
import { AdminMetaRoles } from '../../decorator/admin-roles.decorator';
import { AdminRoles } from '../../enum/admin-roles.enum';
import { AdminRolesGuard } from '../../guards/admin-roles.guard';
import { AdminMetaPermissions } from '../../decorator/admin-permissions.decorator';
import { AdminPermissions } from '../../enum/admin-permission.enum';
import { AdminPermissionGuard } from '../../guards/admin-permission.guard';
import { AdminJwtAuthGuard } from '../../guards/admin-jwt-auth.guard';

@Controller('pattern')
export class PatternController {
  private logger = new Logger(PatternController.name);

  constructor(private patternService: PatternService) {}

  /**
   * ADD DATA
   * addPattern()
   * insertManyPattern()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addPattern(
    @Body()
    addPatternDto: AddPatternDto,
  ): Promise<ResponsePayload> {
    return await this.patternService.addPattern(addPatternDto);
  }

  @Post('/add-by-shop')
  @UsePipes(ValidationPipe)
  async addPatternByShop(
    @Body()
    addColorDto: AddColorDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.patternService.addPatternByShop(shop, addColorDto);
  }

  /**
   * GET DATA
   * getAllPatterns()
   * getPatternById()
   * getUserPatternById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllPatterns(
    @Body() filterPatternDto: FilterAndPaginationPatternDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.patternService.getAllPatterns(filterPatternDto, searchString);
  }

  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllPatternByShop(
    @Body() filterColorDto: FilterAndPaginationColorDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.patternService.getAllPatternByShop(
      shop,
      filterColorDto,
      searchString,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-pattern')
  async getPatternByName(
    @Query('name') name: string,
  ): Promise<ResponsePayload> {
    return this.patternService.getPatternByName(name);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getPatternById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.patternService.getPatternById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-pattern/:id')
  @UsePipes(ValidationPipe)
  async getUserPatternById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.patternService.getUserPatternById(id, select);
  }

  /**
   * UPDATE DATA
   * updatePatternById()
   * updateMultiplePatternById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updatePatternById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updatePatternDto: UpdatePatternDto,
  ): Promise<ResponsePayload> {
    return await this.patternService.updatePatternById(id, updatePatternDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultiplePatternById(
    @Body() updatePatternDto: UpdatePatternDto,
  ): Promise<ResponsePayload> {
    return await this.patternService.updateMultiplePatternById(
      updatePatternDto.ids,
      updatePatternDto,
    );
  }

  /**
   * DELETE DATA
   * deletePatternById()
   * deleteMultiplePatternById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deletePatternById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.patternService.deletePatternById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultiplePatternById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.patternService.deleteMultiplePatternById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
