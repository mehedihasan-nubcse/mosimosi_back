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
  AddProductPurchaseLogDto,
  FilterAndPaginationProductPurchaseLogDto, UpdateProductPurchaseLogDto,
} from '../../../dto/product-purchase-log.dto';
import { ProductPurchaseLog } from '../../../interfaces/common/product-purchase-log.interface';
import { ProductPurchase } from '../../../interfaces/common/product-purchase.interface';
import { FilterAndPaginationProductPurchaseDto } from '../../../dto/product-purchase.dto';

const ObjectId = Types.ObjectId;

@Injectable()
export class ProductPurchaseLogService {
  private logger = new Logger(ProductPurchaseLogService.name);

  constructor(
    @InjectModel('ProductPurchaseLog')
    private readonly productPurchaseLogModel: Model<ProductPurchaseLog>,
    @InjectModel('ProductPurchase')
    private readonly productPurchaseModel: Model<ProductPurchase>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * ADD DATA
   * addProductPurchaseLog()
   * insertManyProductPurchaseLog()
   */
  async addProductPurchaseLog(
    addProductPurchaseLogDto: AddProductPurchaseLogDto,
  ): Promise<ResponsePayload> {
    try {
      const createdAtString = this.utilsService.getDateString(new Date());
      const data = new this.productPurchaseLogModel({
        ...addProductPurchaseLogDto,
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

  async addProductPurchaseLogByShop(
    shop: string,
    addColorDto: AddColorDto,
  ): Promise<ResponsePayload> {
    try {
      const createdAtString = this.utilsService.getDateString(new Date());
      const data = new this.productPurchaseLogModel({
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
   * getAllProductPurchaseLogs()
   * getProductPurchaseLogById()
   * getUserProductPurchaseLogById()
   */
  async getAllProductPurchases(
    filterProductPurchaseDto: FilterAndPaginationProductPurchaseLogDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterProductPurchaseDto;
    const { pagination } = filterProductPurchaseDto;
    const { sort } = filterProductPurchaseDto;
    const { select } = filterProductPurchaseDto;

    // Essential Variables
    const aggregateStages = [];

    //calculations
    const aggregateStagesCalculation = [];
    let mFilter = {};
    let mSort = {};
    let mSelect = {};
    let mPagination = {};

    // Match

    if (filter['shop']) {
      filter['shop'] = new ObjectId(filter['shop']);
    }

    if (filter && filter['product._id']) {
      filter['product._id'] = new ObjectId(filter['product._id']);
    }
    if (filter && filter['product.vendor._id']) {
      filter['product.vendor._id'] = new ObjectId(filter['product.vendor._id']);
    }

    // if (filter && filter['product.vendor.name']) {
    //   filter['product.vendor.name'] = filter['product.vendor.name'];
    // }

    // Match
    if (filter) {
      mFilter = { ...mFilter, ...filter };

      aggregateStagesCalculation.push({ $match: mFilter });
      aggregateStagesCalculation.push({
        $group: {
          _id: null,
          totalAmount: {
            $sum: {
              $multiply: [
                '$product.purchasePrice',
                { $subtract: ['$updatedQuantity', '$previousQuantity'] },
              ],
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
                '$product.purchasePrice',
                { $subtract: ['$updatedQuantity', '$previousQuantity'] },
              ],
            },
          },
        },
      });
    }

    // if (searchQuery) {
    //   mFilter = {
    //     ...mFilter,
    //     ...{ 'product.name': new RegExp(searchQuery, 'i') },
    //   };
    // }
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

    // this.updateMissingProductPurchaseFields();

    try {
      const dataAggregates = await this.productPurchaseLogModel.aggregate(
        aggregateStages,
      );

      const calculateAggregates = await this.productPurchaseLogModel.aggregate(
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

  async getAllProductPurchaseLogByShop(
    shop: string,
    filterColorDto: FilterAndPaginationProductPurchaseLogDto,
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

      return this.getAllProductPurchases(filterColorDto, searchQuery);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getProductPurchaseLogById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productPurchaseLogModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getProductPurchaseLogByName(
    name: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productPurchaseLogModel.find({ name: name });
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

  async getUserProductPurchaseLogById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productPurchaseLogModel.findById(id);
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
   * updateProductPurchaseLogById()
   * updateMultipleProductPurchaseLogById()
   */
  async updateProductPurchaseLogById(
    id: string,
    updateProductPurchaseLogDto: UpdateProductPurchaseLogDto,
  ): Promise<ResponsePayload> {
    try {
      const finalData = { ...updateProductPurchaseLogDto };

      await this.productPurchaseLogModel.findByIdAndUpdate(id, {
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

  async updateMultipleProductPurchaseLogById(
    ids: string[],
    updateProductPurchaseLogDto: UpdateProductPurchaseLogDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.productPurchaseLogModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateProductPurchaseLogDto },
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
   * deleteProductPurchaseLogById()
   * deleteMultipleProductPurchaseLogById()
   */
  async deleteProductPurchaseLogById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.productPurchaseLogModel.findById(id);
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
      await this.productPurchaseLogModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleProductPurchaseLogById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.productPurchaseLogModel.deleteMany({ _id: mIds });
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
      const logsToRestore = await this.productPurchaseLogModel
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

      await this.productPurchaseModel.insertMany(productsToRestore);

      await this.productPurchaseLogModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
