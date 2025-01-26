import {
  Body,
  Controller, Delete, Get,
  Logger, Param,
  Post, Put,
  Query, UseGuards,
  UsePipes,
  ValidationPipe,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ProblemService } from './problem.service';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { AddColorDto, FilterAndPaginationColorDto } from '../../dto/color.dto';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';
import { AddProblemDto, FilterAndPaginationProblemDto, UpdateProblemDto } from '../../dto/problem.dto';
import { AdminMetaRoles } from '../../decorator/admin-roles.decorator';
import { AdminRoles } from '../../enum/admin-roles.enum';
import { AdminRolesGuard } from '../../guards/admin-roles.guard';
import { AdminMetaPermissions } from '../../decorator/admin-permissions.decorator';
import { AdminPermissions } from '../../enum/admin-permission.enum';
import { AdminPermissionGuard } from '../../guards/admin-permission.guard';
import { AdminJwtAuthGuard } from '../../guards/admin-jwt-auth.guard';


@Controller('problem')
export class ProblemController {
  private logger = new Logger(ProblemController.name);

  constructor(private problemService: ProblemService) {}

  /**
   * ADD DATA
   * addProblem()
   * insertManyProblem()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addProblem(
    @Body()
    addProblemDto: AddProblemDto,
  ): Promise<ResponsePayload> {
    return await this.problemService.addProblem(addProblemDto);
  }

  @Post('/add-by-shop')
  @UsePipes(ValidationPipe)
  async addProblemByShop(
    @Body()
      addColorDto: AddColorDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.problemService.addProblemByShop(shop, addColorDto);
  }

  /**
   * GET DATA
   * getAllProblems()
   * getProblemById()
   * getUserProblemById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllProblems(
    @Body() filterProblemDto: FilterAndPaginationProblemDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.problemService.getAllProblems(filterProblemDto, searchString);
  }

  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllProblemByShop(
    @Body() filterColorDto: FilterAndPaginationColorDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.problemService.getAllProblemByShop(
      shop,
      filterColorDto,
      searchString,
    );
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-problem')
  async getProblemByName(@Query('name') name: string): Promise<ResponsePayload> {
    return this.problemService.getProblemByName(name);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getProblemById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.problemService.getProblemById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-problem/:id')
  @UsePipes(ValidationPipe)
  async getUserProblemById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.problemService.getUserProblemById(id, select);
  }

  /**
   * UPDATE DATA
   * updateProblemById()
   * updateMultipleProblemById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateProblemById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateProblemDto: UpdateProblemDto,
  ): Promise<ResponsePayload> {
    return await this.problemService.updateProblemById(id, updateProblemDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleProblemById(
    @Body() updateProblemDto: UpdateProblemDto,
  ): Promise<ResponsePayload> {
    return await this.problemService.updateMultipleProblemById(
      updateProblemDto.ids,
      updateProblemDto,
    );
  }

  /**
   * DELETE DATA
   * deleteProblemById()
   * deleteMultipleProblemById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteProblemById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.problemService.deleteProblemById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleProblemById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.problemService.deleteMultipleProblemById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
