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
  AddNotesDto,
  FilterAndPaginationNotesDto,
  OptionNotesDto,
  UpdateNotesDto,
} from '../../dto/notes.dto';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';
import { NotesService } from './notes.service';

@Controller('notes')
export class NotesController {
  private logger = new Logger(NotesController.name);

  constructor(private notesService: NotesService) {}

  /**
   * Public Api
   * getAllNotesByShop()
   */
  @Post('/get-all-by-shop')
  @UsePipes(ValidationPipe)
  async getAllNotesByShop(
    @Body() filterNotesDto: FilterAndPaginationNotesDto,
    @Query('shop', MongoIdValidationPipe) shop: string,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.notesService.getAllNotesByShop(
      shop,
      filterNotesDto,
      searchString,
    );
  }

  /**
   * Notes Controller Methods
   * addNotes() -> /add
   * getAllNotess() -> /get-all
   * getNotesById() -> /get-by-notes
   * getNotesByDate() -> /get-by-notes
   * getUserNotesById() -> /:id
   * updateNotesById() -> /update/:id
   * updateMultipleNotesById() ->  /update-multiple
   * deleteNotesById() -> /delete/:id
   * deleteMultipleNotesById() -> /delete-multiple
   */

  @Post('/add')
  @UsePipes(ValidationPipe)
  async addNotes(
    @Body()
    addNotesDto: AddNotesDto,

    @Query('shop', MongoIdValidationPipe) shop: string,
  ): Promise<ResponsePayload> {
    return await this.notesService.addNotes(shop, addNotesDto);
  }
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllNotess(
    @Body() filterNotesDto: FilterAndPaginationNotesDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.notesService.getAllNotess(filterNotesDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-notes')
  async getNotesByDate(@Query('date') date: string): Promise<ResponsePayload> {
    return this.notesService.getNotesByDate(date);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getNotesById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.notesService.getNotesById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-notes/:id')
  @UsePipes(ValidationPipe)
  async getUserNotesById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.notesService.getUserNotesById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateNotesById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateNotesDto: UpdateNotesDto,
  ): Promise<ResponsePayload> {
    return await this.notesService.updateNotesById(id, updateNotesDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleNotesById(
    @Body() updateNotesDto: UpdateNotesDto,
  ): Promise<ResponsePayload> {
    return await this.notesService.updateMultipleNotesById(
      updateNotesDto.ids,
      updateNotesDto,
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
  async deleteNotesById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.notesService.deleteNotesById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleNotesById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.notesService.deleteMultipleNotesById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
