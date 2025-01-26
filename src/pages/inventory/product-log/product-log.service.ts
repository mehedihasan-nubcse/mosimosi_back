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
  AddProductLogDto,
  FilterAndPaginationProductLogDto,
  UpdateProductLogDto,
} from '../../../dto/product-log.dto';
import { ProductLog } from 'src/interfaces/common/product-log.interface';
import {
  AddColorDto,
  FilterAndPaginationColorDto,
} from '../../../dto/color.dto';
import { FilterAndPaginationProductDto } from '../../../dto/product.dto';
import { Product } from '../../../interfaces/common/product.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class ProductLogService {
  private logger = new Logger(ProductLogService.name);

  constructor(
    @InjectModel('ProductLog')
    private readonly productLogModel: Model<ProductLog>,

    @InjectModel('Product')
    private readonly productModel: Model<Product>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * ADD DATA
   * addProductLog()
   * insertManyProductLog()
   */
  async addProductLog(
    addProductLogDto: AddProductLogDto,
  ): Promise<ResponsePayload> {
    try {
      const createdAtString = this.utilsService.getDateString(new Date());
      const data = new this.productLogModel({
        ...addProductLogDto,
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

  async addProductLogByShop(
    shop: string,
    addColorDto: AddColorDto,
  ): Promise<ResponsePayload> {
    try {
      const createdAtString = this.utilsService.getDateString(new Date());
      const data = new this.productLogModel({
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
   * getAllProductLogs()
   * getProductLogById()
   * getUserProductLogById()
   */

  async getAllProducts(
    filterProductDto: FilterAndPaginationProductDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterProductDto;
    const { pagination } = filterProductDto;
    const { sort } = filterProductDto;
    const { select } = filterProductDto;

    // Essential Variables
    const aggregateStages = [];
    let mFilter = {};
    let mSort = {};
    let mSelect = {};
    let mPagination = {};

    // Calculations
    const aggregateStagesCalculation = [];

    // Match
    if (filter) {
      if (filter['shop']) {
        filter['shop'] = new ObjectId(filter['shop']);
      }
    }

    // Handle `category.name` variations
    if (filter['category.name']) {
      const categoryNameVariations = [
        filter['category.name'],
        filter['category.name'].trim(),
        ` ${filter['category.name']} `,
        ` ${filter['category.name']}`,
        `${filter['category.name']} `,
        `  ${filter['category.name']}  `,
        `  ${filter['category.name']}`,
        `  ${filter['category.name']} `,
        `${filter['category.name']}  `,
        ` ${filter['category.name']}  `,
      ];
      filter['category.name'] = { $in: categoryNameVariations };
    }

    // console.log("filter",filter);
    // Match
    if (filter) {
      // if (filter['category']) {
      //   filter['category'] = new ObjectId(filter['category']);
      // }
      if (filter['subcategory._id']) {
        filter['subcategory._id'] = new ObjectId(filter['subcategory._id']);
      }

      if (filter['vendor']) {
        filter['vendor'] = new ObjectId(filter['vendor']);
      }

      if (filter['brand._id']) {
        filter['brand._id'] = new ObjectId(filter['brand._id']);
      }

      if (filter['unit._id']) {
        filter['unit._id'] = new ObjectId(filter['unit._id']);
      }

      mFilter = { ...mFilter, ...filter };

      if (searchQuery) {
        mFilter = {
          $and: [
            mFilter,
            {
              $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { imei: { $regex: searchQuery } },
                { sku: { $regex: searchQuery } },
                { batchNumber: { $regex: searchQuery } },
                // { model: { $regex: searchQuery, $options: 'i' } },
              ],
            },
          ],
        };
      }

      // Calculations
      const group = {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          sumPurchasePrice: { $sum: '$purchasePrice' },
          sumSalePrice: { $sum: '$salePrice' },
          totalPurchasePrice: {
            $sum: {
              $multiply: ['$purchasePrice', '$quantity'],
            },
          },
          totalSalePrice: {
            $sum: {
              $multiply: ['$salePrice', '$quantity'],
            },
          },
        },
      };

      aggregateStagesCalculation.push({ $match: mFilter });
      aggregateStagesCalculation.push(group);
    } else {
      // Calculations
      const group = {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          sumPurchasePrice: { $sum: '$purchasePrice' },
          sumSalePrice: { $sum: '$salePrice' },
          totalPurchasePrice: {
            $sum: {
              $multiply: ['$purchasePrice', '$quantity'],
            },
          },
          totalSalePrice: {
            $sum: {
              $multiply: ['$salePrice', '$quantity'],
            },
          },
        },
      };
      aggregateStagesCalculation.push(group);
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
      const dataAggregates = await this.productLogModel.aggregate(
        aggregateStages,
      );

      const calculateAggregates = await this.productLogModel.aggregate(
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
  async getAllProductLogByShop(
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

      return this.getAllProducts(filterColorDto, searchQuery);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getProductLogById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productLogModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getProductLogByName(
    name: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productLogModel.find({ name: name });
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

  async getUserProductLogById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productLogModel.findById(id);
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
   * updateProductLogById()
   * updateMultipleProductLogById()
   */
  async updateProductLogById(
    id: string,
    updateProductLogDto: UpdateProductLogDto,
  ): Promise<ResponsePayload> {
    try {
      const finalData = { ...updateProductLogDto };

      await this.productLogModel.findByIdAndUpdate(id, {
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

  async updateMultipleProductLogById(
    ids: string[],
    updateProductLogDto: UpdateProductLogDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.productLogModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateProductLogDto },
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
   * deleteProductLogById()
   * deleteMultipleProductLogById()
   */
  async deleteProductLogById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.productLogModel.findById(id);
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
      await this.productLogModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleProductLogById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.productLogModel.deleteMany({ _id: mIds });
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
      const logsToRestore = await this.productLogModel
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

      await this.productModel.insertMany(productsToRestore);

      await this.productLogModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
