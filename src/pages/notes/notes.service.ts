import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from '../../shared/utils/utils.service';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { ErrorCodes } from '../../enum/error-code.enum';
import {
  AddNotesDto,
  FilterAndPaginationNotesDto,
  UpdateNotesDto,
} from '../../dto/notes.dto';
import { Notes } from 'src/interfaces/common/notes.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class NotesService {
  private logger = new Logger(NotesService.name);

  constructor(
    @InjectModel('Notes') private readonly notesModel: Model<Notes>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * Notes Service Methods
   * addNotes()
   * getAllNotess()
   * getNotesById()
   * getNotesByDate()
   * getUserNotesById()
   * updateNotesById()
   * updateMultipleNotesById()
   * deleteNotesById()
   * deleteMultipleNotesById()
   */

  async addNotes(
    shop: string,
    addNotesDto: AddNotesDto,
  ): Promise<ResponsePayload> {
    try {
      const { date } = addNotesDto;
      const dateString = this.utilsService.getDateString(date);
      const month = this.utilsService.getDateMonth(false, date);
      const year = this.utilsService.getDateYear(date);
      const mData = {
        ...addNotesDto,
        month: month,
        year: year,
        dateString: dateString,
        shop: shop,
      };
      const data = new this.notesModel(mData);
      const saveData = await data.save();

      return {
        success: true,
        message: 'Success! Data Added.',
        data: {
          _id: saveData._id,
        },
      } as ResponsePayload;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllNotesByShop(
    shop: string,
    filterNotesDto: FilterAndPaginationNotesDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    try {
      if (!shop) {
        return {
          success: false,
          message: 'Sorry! no data found.',
        } as ResponsePayload;
      }

      // Modify Filter
      const { filter } = filterNotesDto;
      filterNotesDto.filter = { ...filter, ...{ shop: shop } };

      return this.getAllNotess(filterNotesDto, searchQuery);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllNotess(
    filterNotesDto: FilterAndPaginationNotesDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterNotesDto;
    const { pagination } = filterNotesDto;
    const { sort } = filterNotesDto;
    const { select } = filterNotesDto;

    // Essential Variables
    const aggregateStages = [];

    //calculations
    const aggregateStagesCalculation = [];
    let mFilter = {};
    let mSort = {};
    let mSelect = {};
    let mPagination = {};

    // Match
    if (filter) {
      if (filter['shop']) {
        filter['shop'] = new ObjectId(filter['shop']);
      }
    }

    if (searchQuery) {
      mFilter = {
        ...mFilter,
        ...{ description: new RegExp(searchQuery, 'i') },
      };
    }

    // Match
    if (filter) {
      mFilter = { ...mFilter, ...filter };

      aggregateStagesCalculation.push({ $match: mFilter });
      aggregateStagesCalculation.push({
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      });
    } else {
      aggregateStagesCalculation.push({
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      });
    }

    // Sort
    if (sort) {
      mSort = sort;
    } else {
      mSort = { createdAt: -1 };
    }

    // Select
    if (select) {
      mSelect = { ...select };
    } else {
      mSelect = { name: 1 };
    }

    // Finalize
    if (Object.keys(mFilter).length) {
      aggregateStages.push({ $match: mFilter });
    }

    if (Object.keys(mSort).length) {
      aggregateStages.push({ $sort: mSort });
    }

    if (!pagination) {
      aggregateStages.push({ $project: mSelect });
    }

    // Pagination
    if (pagination) {
      if (Object.keys(mSelect).length) {
        mPagination = {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              {
                $skip: pagination.pageSize * pagination.currentPage,
              } /* IF PAGE START FROM 0 OR (pagination.currentPage - 1) IF PAGE 1*/,
              { $limit: pagination.pageSize },
              { $project: mSelect },
            ],
          },
        };
      } else {
        mPagination = {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              {
                $skip: pagination.pageSize * pagination.currentPage,
              } /* IF PAGE START FROM 0 OR (pagination.currentPage - 1) IF PAGE 1*/,
              { $limit: pagination.pageSize },
            ],
          },
        };
      }

      aggregateStages.push(mPagination);

      aggregateStages.push({
        $project: {
          data: 1,
          count: { $arrayElemAt: ['$metadata.total', 0] },
        },
      });
    }

    try {
      const dataAggregates = await this.notesModel.aggregate(aggregateStages);
      const calculateAggregates = await this.notesModel.aggregate(
        aggregateStagesCalculation,
      );

      if (pagination) {
        return {
          ...{ ...dataAggregates[0] },
          ...{
            success: true,
            message: 'Success',
            calculation: calculateAggregates[0],
          },
        } as ResponsePayload;
      } else {
        return {
          data: dataAggregates,
          success: true,
          message: 'Success',
          count: dataAggregates.length,
          calculation: calculateAggregates[0],
        } as ResponsePayload;
      }
    } catch (err) {
      this.logger.error(err);
      if (err.code && err.code.toString() === ErrorCodes.PROJECTION_MISMATCH) {
        throw new BadRequestException('Error! Projection mismatch');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getNotesById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.notesModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getNotesByDate(
    date: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.notesModel.find({ date: date });
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  async getUserNotesById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.notesModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async updateNotesById(
    id: string,
    updateNotesDto: UpdateNotesDto,
  ): Promise<ResponsePayload> {
    try {
      const { date } = updateNotesDto;
      const dateString = this.utilsService.getDateString(date);
      const month = this.utilsService.getDateMonth(false, date);
      const year = this.utilsService.getDateYear(date);
      const mData = {
        ...updateNotesDto,
        month: month,
        year: year,
        dateString: dateString,
      };

      await this.notesModel.findByIdAndUpdate(id, {
        $set: mData,
      });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async updateMultipleNotesById(
    ids: string[],
    updateNotesDto: UpdateNotesDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.notesModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateNotesDto },
      );

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteNotesById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.notesModel.findById(id);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
    if (!data) {
      throw new NotFoundException('No Data found!');
    }
    if (data.readOnly) {
      throw new NotFoundException('Sorry! Read only data can not be deleted');
    }
    try {
      await this.notesModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleNotesById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.notesModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
