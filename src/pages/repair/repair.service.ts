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
  AddRepairDto,
  FilterAndPaginationRepairDto,
  UpdateRepairDto,
} from '../../dto/repair.dto';
import { Repair } from 'src/interfaces/common/repair.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class RepairService {
  private logger = new Logger(RepairService.name);

  constructor(
    @InjectModel('Repair') private readonly repairModel: Model<Repair>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * Repair Service Methods
   * addRepair()
   * getAllRepairs()
   * getRepairById()
   * getRepairByDate()
   * getUserRepairById()
   * updateRepairById()
   * updateMultipleRepairById()
   * deleteRepairById()
   * deleteMultipleRepairById()
   */

  async addRepair(
    shop: string,
    addRepairDto: AddRepairDto,
  ): Promise<ResponsePayload> {
    try {
      const { date } = addRepairDto;
      const dateString = this.utilsService.getDateString(date);
      const dateTime = this.utilsService.getCurrentTime();
      const month = this.utilsService.getDateMonth(false, date);
      const year = this.utilsService.getDateYear(date);
      const mData = {
        ...addRepairDto,
        month: month,
        year: year,
        dateString: dateString,
        updateTime: dateTime,
        shop: shop,
      };
      const data = new this.repairModel(mData);
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

  async getAllRepairByShop(
    shop: string,
    filterRepairDto: FilterAndPaginationRepairDto,
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
      const { filter } = filterRepairDto;
      filterRepairDto.filter = { ...filter, ...{ shop: shop } };

      return this.getAllRepairs(filterRepairDto, searchQuery);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllRepairs(
    filterRepairDto: FilterAndPaginationRepairDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterRepairDto;
    const { pagination } = filterRepairDto;
    const { sort } = filterRepairDto;
    const { select } = filterRepairDto;

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
    // if (searchQuery) {
    //   mFilter = {
    //     ...mFilter,
    //     ...{
    //       // repairFor: new RegExp(searchQuery, 'i'),
    //       phoneNo: new RegExp(searchQuery, 'i'),
    //     },
    //   };
    // }

    // Search Query Handling
    if (searchQuery) {
      mFilter = {
        $and: [
          mFilter,
          {
            $or: [
              { phoneNo: { $regex: searchQuery, $options: 'i' } },
              { 'modelNo.name': { $regex: searchQuery, $options: 'i' } },
            ],
          },
        ],
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
      const dataAggregates = await this.repairModel.aggregate(aggregateStages);
      const calculateAggregates = await this.repairModel.aggregate(
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

  async getRepairById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.repairModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getRepairByDate(
    date: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.repairModel.find({ date: date });
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

  async getUserRepairById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.repairModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async updateRepairById(
    id: string,
    updateRepairDto: UpdateRepairDto,
  ): Promise<ResponsePayload> {
    try {
      const { date } = updateRepairDto;
      const dateString = this.utilsService.getDateString(date);
      const month = this.utilsService.getDateMonth(false, date);
      const year = this.utilsService.getDateYear(date);
      const dateTime = this.utilsService.getCurrentTime();
      const mData = {
        ...updateRepairDto,
        deliveredTime: dateTime,
        // month: month,
        // year: year,
        // dateString: dateString,
      };

      await this.repairModel.findByIdAndUpdate(id, {
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

  async updateMultipleRepairById(
    ids: string[],
    updateRepairDto: UpdateRepairDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.repairModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateRepairDto },
      );

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteRepairById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.repairModel.findById(id);
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
      await this.repairModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleRepairById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.repairModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
