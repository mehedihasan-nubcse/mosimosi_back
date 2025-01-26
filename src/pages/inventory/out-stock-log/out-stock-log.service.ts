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
import { OutStockLog } from '../../../interfaces/common/out-stock-log.interface';
import {
  AddOutStockLogDto,
  FilterAndPaginationOutStockLogDto,
  UpdateOutStockLogDto,
} from '../../../dto/out-stock-log.dto';
import { ProductDamage } from '../../../interfaces/common/product-damage.interface';
import { FilterAndPaginationProductDamageDto } from '../../../dto/product-damage.dto';

const ObjectId = Types.ObjectId;

@Injectable()
export class OutStockLogService {
  private logger = new Logger(OutStockLogService.name);

  constructor(
    @InjectModel('OutStockLog')
    private readonly outStockLogModel: Model<OutStockLog>,

    @InjectModel('ProductDamage')
    private readonly productDamageModel: Model<ProductDamage>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * ADD DATA
   * addOutStockLog()
   * insertManyOutStockLog()
   */
  async addOutStockLog(
    addOutStockLogDto: AddOutStockLogDto,
  ): Promise<ResponsePayload> {
    try {
      const createdAtString = this.utilsService.getDateString(new Date());
      const data = new this.outStockLogModel({
        ...addOutStockLogDto,
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

  async addOutStockLogByShop(
    shop: string,
    addColorDto: AddColorDto,
  ): Promise<ResponsePayload> {
    try {
      const createdAtString = this.utilsService.getDateString(new Date());
      const data = new this.outStockLogModel({
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
   * getAllOutStockLogs()
   * getOutStockLogById()
   * getUserOutStockLogById()
   */
  async getAllOutStockLogs(
    filterProductDamageDto: FilterAndPaginationOutStockLogDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterProductDamageDto;
    const { pagination } = filterProductDamageDto;
    const { sort } = filterProductDamageDto;
    const { select } = filterProductDamageDto;

    // Essential Variables
    const aggregateStages = [];

    //calculations
    const aggregateStagesCalculation = [];
    let mFilter = {};
    let mSort = {};
    let mSelect = {};
    let mPagination = {};

    if (filter) {
      if (filter['shop']) {
        filter['shop'] = new ObjectId(filter['shop']);
      }
    }

    // Match
    if (filter) {
      if (filter['product._id']) {
        filter['product._id'] = new ObjectId(filter['product._id']);
      }
      mFilter = { ...mFilter, ...filter };

      aggregateStagesCalculation.push({ $match: mFilter });
      aggregateStagesCalculation.push({
        $group: {
          _id: null,
          totalAmount: {
            $sum: {
              $multiply: ['$product.purchasePrice', '$quantity'],
            },
          },
        },
      });
    } else {
      aggregateStagesCalculation.push({
        $group: {
          _id: null,
          totalAmount: {
            $sum: {
              $multiply: [
                '$product.damagePrice',
                { $subtract: ['$updatedQuantity', '$previousQuantity'] },
              ],
            },
          },
        },
      });
    }

    if (searchQuery) {
      mFilter = {
        $and: [
          mFilter,
          {
            $or: [
              { 'product.name': { $regex: searchQuery, $options: 'i' } },
              { 'product.imei': { $regex: searchQuery } },
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
      const dataAggregates = await this.outStockLogModel.aggregate(
        aggregateStages,
      );
      const calculateAggregates = await this.outStockLogModel.aggregate(
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

  async getAllOutStockLogByShop(
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

      return this.getAllOutStockLogs(filterColorDto, searchQuery);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getOutStockLogById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.outStockLogModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getOutStockLogByName(
    name: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.outStockLogModel.find({ name: name });
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

  async getUserOutStockLogById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.outStockLogModel.findById(id);
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
   * updateOutStockLogById()
   * updateMultipleOutStockLogById()
   */
  async updateOutStockLogById(
    id: string,
    updateOutStockLogDto: UpdateOutStockLogDto,
  ): Promise<ResponsePayload> {
    try {
      const finalData = { ...updateOutStockLogDto };

      await this.outStockLogModel.findByIdAndUpdate(id, {
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

  async updateMultipleOutStockLogById(
    ids: string[],
    updateOutStockLogDto: UpdateOutStockLogDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.outStockLogModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateOutStockLogDto },
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
   * deleteOutStockLogById()
   * deleteMultipleOutStockLogById()
   */
  async deleteOutStockLogById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.outStockLogModel.findById(id);
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
      await this.outStockLogModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleOutStockLogById(
    adminId: string,
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.outStockLogModel.deleteMany({ _id: mIds });
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
      const logsToRestore = await this.outStockLogModel
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

      await this.productDamageModel.insertMany(productsToRestore);

      await this.outStockLogModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
