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
import { UtilsService } from '../../../shared/utils/utils.service';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { ErrorCodes } from '../../../enum/error-code.enum';

import {
  AddColorDto,
  FilterAndPaginationColorDto,
} from '../../../dto/color.dto';
import {
  AddSalesLogDto,
  FilterAndPaginationSalesLogDto,
  UpdateSalesLogDto,
} from '../../../dto/sales-log.dto';
import { SalesLog } from '../../../interfaces/common/sales-log.interface';
import { Sales } from '../../../interfaces/common/sales.interface';
import { FilterAndPaginationSalesDto } from '../../../dto/sales.dto';

const ObjectId = Types.ObjectId;

@Injectable()
export class SalesLogService {
  private logger = new Logger(SalesLogService.name);

  constructor(
    @InjectModel('SalesLog') private readonly salesLogModel: Model<SalesLog>,
    @InjectModel('Sales')
    private readonly salesModel: Model<Sales>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * ADD DATA
   * addSalesLog()
   * insertManySalesLog()
   */
  async addSalesLog(addSalesLogDto: AddSalesLogDto): Promise<ResponsePayload> {
    try {
      const createdAtString = this.utilsService.getDateString(new Date());
      const data = new this.salesLogModel({
        ...addSalesLogDto,
        createdAtString,
      });
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

  async addSalesLogByShop(
    shop: string,
    addColorDto: AddColorDto,
  ): Promise<ResponsePayload> {
    try {
      const createdAtString = this.utilsService.getDateString(new Date());
      const data = new this.salesLogModel({
        ...addColorDto,
        createdAtString,
        shop: shop,
      });
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
  /**
   * GET DATA
   * getAllSalesLogs()
   * getSalesLogById()
   * getUserSalesLogById()
   */
  async getAllSales(
    filterSalesDto: FilterAndPaginationSalesLogDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter, pagination, sort, select } = filterSalesDto;

    // Essential Variables
    const aggregateStages = [];
    let mFilter = {};
    let mSort = {};
    let mSelect = {};
    let mPagination = {};

    // Calculations
    const aggregateStagesCalculation = [];

    // console.log("filter", filter);

    // Match
    if (filter) {
      if (filter['shop']) {
        filter['shop'] = new ObjectId(filter['shop']);
      }
      if (filter['products.category._id']) {
        filter['products.category._id'] = new ObjectId(
          filter['products.category._id'],
        );
      }
      if (filter['products._id']) {
        filter['products._id'] = new ObjectId(filter['products._id']);
      }

      // Additional filtering for customer and salesman IDs
      if (filter['customer._id']) {
        filter['customer._id'] = new ObjectId(filter['customer._id']);
      }
      if (filter['salesman._id']) {
        filter['salesman._id'] = new ObjectId(filter['salesman._id']);
      }

      mFilter = { ...mFilter, ...filter };

      // Calculations
      const group = {
        $group: {
          _id: null,
          grandTotal: { $sum: '$total' },
        },
      };

      aggregateStagesCalculation.push({ $match: mFilter });
      aggregateStagesCalculation.push(group);
    } else {
      // Default group calculation if no filter
      const group = {
        $group: {
          _id: null,
          grandTotal: { $sum: '$total' },
        },
      };
      aggregateStagesCalculation.push(group);
    }

    // Search Query Handling
    if (searchQuery) {
      mFilter = {
        $and: [
          mFilter,
          {
            $or: [
              { invoiceNo: { $regex: searchQuery, $options: 'i' } },
              { 'products.imei': { $regex: searchQuery, $options: 'i' } },
              { 'customer.phone': { $regex: searchQuery, $options: 'i' } },
              { 'salesman.phone': { $regex: searchQuery, $options: 'i' } },
            ],
          },
        ],
      };
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

    // Finalize Aggregate Stages
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
              { $skip: pagination.pageSize * pagination.currentPage },
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
              { $skip: pagination.pageSize * pagination.currentPage },
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
      const dataAggregates = await this.salesLogModel.aggregate(
        aggregateStages,
      );
      const calculateAggregates = await this.salesLogModel.aggregate(
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

  async getAllSalesLogByShop(
    shop: string,
    filterColorDto: FilterAndPaginationColorDto,
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
      const { filter } = filterColorDto;
      filterColorDto.filter = { ...filter, ...{ shop: shop } };

      return this.getAllSales(filterColorDto, searchQuery);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getSalesLogById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.salesLogModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getSalesLogByName(
    name: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.salesLogModel.find({ name: name });
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

  async getUserSalesLogById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.salesLogModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * UPDATE DATA
   * updateSalesLogById()
   * updateMultipleSalesLogById()
   */
  async updateSalesLogById(
    id: string,
    updateSalesLogDto: UpdateSalesLogDto,
  ): Promise<ResponsePayload> {
    try {
      const finalData = { ...updateSalesLogDto };

      await this.salesLogModel.findByIdAndUpdate(id, {
        $set: finalData,
      });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async updateMultipleSalesLogById(
    ids: string[],
    updateSalesLogDto: UpdateSalesLogDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.salesLogModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateSalesLogDto },
      );

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * DELETE DATA
   * deleteSalesLogById()
   * deleteMultipleSalesLogById()
   */
  async deleteSalesLogById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.salesLogModel.findById(id);
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
      await this.salesLogModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleSalesLogById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.salesLogModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async restoreMultipleProductLogById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      // Fetch the logs from the productLog collection
      const logsToRestore = await this.salesLogModel
        .find({ _id: { $in: mIds } })
        .lean();

      if (logsToRestore.length === 0) {
        return {
          success: false,
          message: 'No logs found for the provided IDs.',
        } as ResponsePayload;
      }

      // Restore products to the product collection
      const productsToRestore = logsToRestore.map((log) => {
        const {
          deletedAt,
          deleteYear,
          deleteMonth,
          deleteDateString,
          deletedBy,
          ...productData
        } = log; // Exclude log-specific fields
        return productData;
      });

      await this.salesModel.insertMany(productsToRestore);

      await this.salesLogModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
