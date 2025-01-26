import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { BuyBack } from 'src/interfaces/common/buy-back.interface';

import { UniqueId } from 'src/interfaces/core/unique-id.interface';
import { Unit } from 'src/interfaces/common/unit.interface';
import { Category } from 'src/interfaces/common/category.interface';
import { Brand } from '../../interfaces/common/brand.interface';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';

import { ErrorCodes } from '../../enum/error-code.enum';
// import { BuyBackDamage } from '../../interfaces/common/buyBack-damage.interface';
import { SubCategory } from '../../interfaces/common/sub-category.interface';
import { UtilsService } from '../../shared/utils/utils.service';
import {
  AddBuyBackDto,
  FilterAndPaginationBuyBackDto,
  UpdateBuyBackDto,
} from '../../dto/buy-back.dto';
// import { BuyBackPurchase } from '../../interfaces/common/buyBack-purchase.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class BuyBackService {
  private logger = new Logger(BuyBackService.name);

  constructor(
    @InjectModel('BuyBack')
    private readonly buyBackModel: Model<BuyBack>,
    @InjectModel('Category')
    private readonly categoryModel: Model<Category>,
    @InjectModel('SubCategory')
    private readonly SubCategoryModel: Model<SubCategory>,
    @InjectModel('Brand')
    private readonly brandModel: Model<Brand>,
    @InjectModel('Unit')
    private readonly unitModel: Model<Unit>,
    @InjectModel('UniqueId')
    private readonly uniqueIdModel: Model<UniqueId>,
    // @InjectModel('BuyBackPurchase')
    // private readonly buyBackPurchaseModel: Model<BuyBackPurchase>,
    // @InjectModel('BuyBackDamage')
    // private readonly buyBackDamageModel: Model<BuyBackDamage>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * ADD DATA
   * addBuyBack()
   * insertManyBuyBack()
   */
  async addBuyBack(
    shop: string,
    addBuyBackDto: AddBuyBackDto,
  ): Promise<ResponsePayload> {
    try {
      const { sku, dateString } = addBuyBackDto;
      // const fShop = await this.shopModel.exists({
      //   _id: shop,
      //   'users._id': admin._id,
      // });
      //
      // if (!fShop) {
      //   return {
      //     success: false,
      //     message: 'Sorry! you have no access in this shop',
      //   } as ResponsePayload;
      // }

      if (sku) {
        const hasData = await this.buyBackModel.findOne({ sku: sku });
        if (hasData) {
          return {
            success: false,
            message: 'Code Error! Code must be unique.',
            data: null,
          } as ResponsePayload;
        }
      }

      const createdAtString = this.utilsService.getDateString(new Date());

      const incOrder = await this.uniqueIdModel.findOneAndUpdate(
        {},
        { $inc: { buyBackId: 1 } },
        { new: true, upsert: true },
      );

      const buyBackIdUnique = this.utilsService.padLeadingZeros(
        incOrder.buyBackId,
      );

      const dataExtra = {
        buyBackId: buyBackIdUnique,
        createdAtString: createdAtString,
        soldQuantity: 0,
      };

      const mData = {
        ...addBuyBackDto,
        ...dataExtra,
        ...{
          shop: shop,
        },
      };

      const data = new this.buyBackModel(mData);
      const saveData = await data.save();

      // const purchaseData = {
      //   buyBack: {
      //     _id: saveData._id,
      //     name: addBuyBackDto.name || null,
      //     sku: addBuyBackDto.sku || null,
      //     others: addBuyBackDto.others || null,
      //     model: addBuyBackDto.model || null,
      //     salePrice: addBuyBackDto.salePrice || null,
      //     purchasePrice: addBuyBackDto.purchasePrice || null,
      //   },
      //   month: dateString
      //     ? this.utilsService.getDateMonth(false, new Date(dateString))
      //     : this.utilsService.getDateMonth(false, new Date()),
      //   year: dateString
      //     ? new Date(dateString).getFullYear()
      //     : new Date().getFullYear(),
      //   previousQuantity: 0,
      //   updatedQuantity: addBuyBackDto.quantity,
      //   createdAtString: this.utilsService.getDateString(new Date()),
      //   createTime: this.utilsService.getCurrentTime(),
      //   dateString: dateString
      //     ? dateString
      //     : this.utilsService.getDateString(new Date()),
      // };
      // await new this.buyBackPurchaseModel(purchaseData).save();

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

  async insertManyBuyBack(
    addBuyBacksDto: AddBuyBackDto[],
  ): Promise<ResponsePayload> {
    try {
      for (let i = 0; i < addBuyBacksDto.length; i++) {
        addBuyBacksDto[i].createdAtString = this.utilsService.getDateString(
          new Date(),
        );
        if (addBuyBacksDto[i].category) {
          const category = await this.categoryModel.findOne({
            name: { $regex: addBuyBacksDto[i].category, $options: 'i' },
          });

          if (category) {
            addBuyBacksDto[i].category = {
              _id: category._id,
              name: category.name,
            };
          } else {
            const newCatSchema = new this.categoryModel({
              name: addBuyBacksDto[i].category,
            });
            const newCat = await newCatSchema.save();
            addBuyBacksDto[i].category = {
              _id: newCat._id,
              name: newCat.name,
            };
          }
        }

        const incOrder = await this.uniqueIdModel.findOneAndUpdate(
          {},
          { $inc: { buyBackId: 1 } },
          { new: true, upsert: true },
        );
        addBuyBacksDto[i].buyBackId = this.utilsService.padLeadingZeros(
          incOrder.buyBackId,
        );
        addBuyBacksDto[i].soldQuantity = 0;
      }

      await this.buyBackModel.insertMany(addBuyBacksDto);

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (error) {
      // console.log(error);
      if (error.code && error.code.toString() === ErrorCodes.UNIQUE_FIELD) {
        throw new ConflictException('Slug Must be Unique');
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  /**
   * GET DATA
   * getAllBuyBacks()
   * getBuyBackById()
   * getUserBuyBackById()
   */

  async getAllBuyBackByShop(
    shop: string,
    filterAndPaginationBuyBackDto: FilterAndPaginationBuyBackDto,
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
      const { filter } = filterAndPaginationBuyBackDto;
      filterAndPaginationBuyBackDto.filter = { ...filter, ...{ shop: shop } };

      return this.getAllBuyBacks(filterAndPaginationBuyBackDto, searchQuery);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllBuyBacks(
    filterBuyBackDto: FilterAndPaginationBuyBackDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterBuyBackDto;
    const { pagination } = filterBuyBackDto;
    const { sort } = filterBuyBackDto;
    const { select } = filterBuyBackDto;

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

    if (filter) {
      if (filter['category._id']) {
        filter['category._id'] = new ObjectId(filter['category._id']);
      }
      if (filter['subcategory._id']) {
        filter['subcategory._id'] = new ObjectId(filter['subcategory._id']);
      }

      if (filter['vendor._id']) {
        filter['vendor._id'] = new ObjectId(filter['vendor._id']);
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
      const dataAggregates = await this.buyBackModel.aggregate(aggregateStages);

      const calculateAggregates = await this.buyBackModel.aggregate(
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

  async getBuyBackById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.buyBackModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getBuyBackByName(
    name: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.buyBackModel.find({ name: name });
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

  async getUserBuyBackById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.buyBackModel.findById(id);
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
   * updateBuyBackById()
   * updateMultipleBuyBackById()
   */
  async updateBuyBackById(
    id: string,
    updateBuyBackDto: UpdateBuyBackDto,
  ): Promise<ResponsePayload> {
    try {
      const { dateString, newQuantity } = updateBuyBackDto;
      const createdAtString = this.utilsService.getDateString(new Date());
      let mData = {
        ...updateBuyBackDto,
        ...{
          createdAtString: createdAtString,
        },
      };

      const previousBuyBackData: BuyBack = await this.buyBackModel.findById(id);

      if (newQuantity) {
        const totalQuantity = previousBuyBackData.quantity + newQuantity;
        mData = {
          ...mData,
          ...{
            quantity: totalQuantity,
          },
        };
      }

      await this.buyBackModel.findByIdAndUpdate(id, {
        $set: mData,
      });

      // if (newQuantity) {
      //   const purchaseData = {
      //     buyBack: {
      //       _id: id,
      //       name: updateBuyBackDto.name,
      //       sku: updateBuyBackDto.sku || null,
      //       others: updateBuyBackDto.others || null,
      //       model: updateBuyBackDto.model || null,
      //       salePrice: updateBuyBackDto.salePrice || null,
      //       purchasePrice: updateBuyBackDto.purchasePrice || null,
      //     },
      //     month: dateString
      //       ? this.utilsService.getDateMonth(false, new Date(dateString))
      //       : this.utilsService.getDateMonth(false, new Date()),
      //     year: dateString
      //       ? new Date(dateString).getFullYear()
      //       : new Date().getFullYear(),
      //     previousQuantity: previousBuyBackData.quantity,
      //     updatedQuantity: mData.quantity,
      //     createdAtString: this.utilsService.getDateString(new Date()),
      //     dateString: dateString
      //       ? dateString
      //       : this.utilsService.getDateString(new Date()),
      //     note: mData.note ?? null,
      //     quantity: mData.newQuantity,
      //   };
      //
      //   await new this.buyBackPurchaseModel(purchaseData).save();
      //   await this.buyBackDamageModel.create(purchaseData);
      // }

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async updateMultipleBuyBackById(
    ids: string[],
    updateBuyBackDto: UpdateBuyBackDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.buyBackModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateBuyBackDto },
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
   * deleteBuyBackById()
   * deleteMultipleBuyBackById()
   */
  async deleteBuyBackById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.buyBackModel.findById(id);
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
      await this.buyBackModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleBuyBackById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.buyBackModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
