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
  AddCourierDto,
  FilterAndPaginationCourierDto,
  UpdateCourierDto,
} from '../../dto/courier.dto';
import { Courier } from 'src/interfaces/common/courier.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class CourierService {
  private logger = new Logger(CourierService.name);

  constructor(
    @InjectModel('Courier') private readonly courierModel: Model<Courier>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * Courier Service Methods
   * addCourier()
   * getAllCouriers()
   * getCourierById()
   * getCourierByDate()
   * getUserCourierById()
   * updateCourierById()
   * updateMultipleCourierById()
   * deleteCourierById()
   * deleteMultipleCourierById()
   */

  async addCourier( shop: string,addCourierDto: AddCourierDto): Promise<ResponsePayload> {
    try {
      const { date } = addCourierDto;
      const dateString = this.utilsService.getDateString(date);
      const month = this.utilsService.getDateMonth(false, date);
      const year = this.utilsService.getDateYear(date);
      const mData = {
        ...addCourierDto,
        ...{
          month: month,
          year: year,
          dateString: dateString,
          shop: shop,
        }
      };
      const data = new this.courierModel(mData);
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




  async getAllCourierByShop(
    shop: string,
    filterCourierDto: FilterAndPaginationCourierDto,
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
      const { filter } = filterCourierDto;
      filterCourierDto.filter = { ...filter, ...{ shop: shop } };

      return this.getAllCouriers(filterCourierDto, searchQuery);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  
  
  async getAllCouriers(
    filterCourierDto: FilterAndPaginationCourierDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterCourierDto;
    const { pagination } = filterCourierDto;
    const { sort } = filterCourierDto;
    const { select } = filterCourierDto;

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
      mFilter = { ...mFilter, ...{ name: new RegExp(searchQuery, 'i') } };
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
      const dataAggregates = await this.courierModel.aggregate(aggregateStages);
      const calculateAggregates = await this.courierModel.aggregate(
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

  async getCourierById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.courierModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getCourierByDate(
    date: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.courierModel.find({ date: date });
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

  async getUserCourierById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.courierModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async updateCourierById(
    id: string,
    updateCourierDto: UpdateCourierDto,
  ): Promise<ResponsePayload> {
    try {
      const { date } = updateCourierDto;
      const dateString = this.utilsService.getDateString(date);
      const month = this.utilsService.getDateMonth(false, date);
      const year = this.utilsService.getDateYear(date);
      const mData = {
        ...updateCourierDto,
        month: month,
        year: year,
        dateString: dateString,
      };

      await this.courierModel.findByIdAndUpdate(id, {
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

  async updateMultipleCourierById(
    ids: string[],
    updateCourierDto: UpdateCourierDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.courierModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateCourierDto },
      );

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteCourierById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.courierModel.findById(id);
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
      await this.courierModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleCourierById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.courierModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
