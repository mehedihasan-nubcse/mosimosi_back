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
  AddProductDamageDto,
  FilterAndPaginationProductDamageDto,
  UpdateProductDamageDto,
} from '../../../dto/product-damage.dto';
import { ProductDamage } from 'src/interfaces/common/product-damage.interface';
import { Product } from '../../../interfaces/common/product.interface';
import { Admin } from '../../../interfaces/admin/admin.interface';
import { OutStockLog } from '../../../interfaces/common/out-stock-log.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class ProductDamageService {
  private logger = new Logger(ProductDamageService.name);

  constructor(
    @InjectModel('ProductDamage')
    private readonly productDamageModel: Model<ProductDamage>,
    @InjectModel('Product')
    private readonly productModel: Model<Product>,
    @InjectModel('Admin')
    private readonly adminModel: Model<Admin>,
    @InjectModel('OutStockLog')
    private readonly outStockLogModel: Model<OutStockLog>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * ADD DATA
   * addProductDamage()
   * insertManyProductDamage()
   */
  async addProductDamage(
    shop: string,
    addProductDamageDto: AddProductDamageDto,
  ): Promise<ResponsePayload> {
    try {
      const { date, quantity, product } = addProductDamageDto;
      // const dateString = this.utilsService.getDateString(new Date());
      const mData = {
        ...addProductDamageDto,
        shop: shop,
      };
      mData.product.name = `${mData.product.name}${
        mData.product.colors ? ' - ' + mData.product.colors.name : ''
      }${mData.product.sizes ? ' - ' + mData.product.sizes.name : ''}`;
      const data = new this.productDamageModel(mData);
      const saveData = await data.save();

      // Adjust Quantity
      if (quantity) {
        await this.productModel.findByIdAndUpdate(
          product._id,
          {
            $inc: { quantity: quantity },
          },
          { new: true, upsert: true },
        );
      }

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
   * getAllProductDamages()
   * getProductDamageById()
   * getUserProductDamageById()
   */

  async getAllProductDamageByShop(
    shop: string,
    filterProductDamageDto: FilterAndPaginationProductDamageDto,
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
      const { filter } = filterProductDamageDto;
      filterProductDamageDto.filter = { ...filter, ...{ shop: shop } };

      return this.getAllProductDamages(filterProductDamageDto, searchQuery);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
  async getAllProductDamages(
    filterProductDamageDto: FilterAndPaginationProductDamageDto,
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

    // if (searchQuery) {
    //   mFilter = { ...mFilter, ...{ name: new RegExp(searchQuery, 'i') } };
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

    try {
      const dataAggregates = await this.productDamageModel.aggregate(
        aggregateStages,
      );
      const calculateAggregates = await this.productDamageModel.aggregate(
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

  async getSimilarProductPurchasesByProductId(
    productId: string,
    dateStringDate: string,
  ): Promise<any> {
    try {
      // console.log('productId', productId);

      // Fetch the product purchase record by its ID
      const productPurchase = await this.productDamageModel
        .findOne({ 'product._id': productId, dateString: dateStringDate })
        .exec();
      // console.log('productPurchase', productPurchase);

      // If product purchase not found, throw an exception
      if (!productPurchase) {
        throw new NotFoundException('Product purchase not found');
      }

      // Extract product and shop details
      const { product, shop, month, year, dateString, updatedQuantity } =
        productPurchase;
      console.log('Fetched product:', product); // Log the product to inspect its structure
      console.log('shop', shop);

      // Check if product and required fields exist
      if (!product || !product.colors || !product.sizes) {
        console.error('Missing required fields in product:', product); // Log missing fields
        throw new NotFoundException('Product or required fields not found');
      }

      const { category, name, colors, sizes } = product;

      // // Check if the necessary fields exist
      // if (!colors._id || !sizes._id) {
      //   console.error('Missing _id in product fields:', {
      //     category,
      //     colors,
      //     sizes,
      //   }); // Log missing _id
      //   throw new NotFoundException('Category, colors, or sizes _id not found');
      // }
      //
      // // Create the query to find similar product purchases
      // const similarProductPurchases = await this.productDamageModel.aggregate([
      //   {
      //     $match: {
      //       $and: [
      //         { 'product.name': name }, // Match product name
      //         { 'product.colors._id': colors._id }, // Match colors._id
      //         { 'product.sizes._id': sizes._id }, // Match sizes._id
      //         { shop: shop }, // Match shop._id
      //         { month: month }, // Match the same month
      //         { year: year }, // Match the same year
      //       ],
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: null,
      //       totalQuantity: { $sum: '$updatedQuantity' },
      //       sumPurchasePrice: {
      //         $sum: {
      //           $multiply: ['$updatedQuantity', '$product.purchasePrice'],
      //         },
      //       },
      //       sumSalePrice: {
      //         $sum: { $multiply: ['$updatedQuantity', '$product.salePrice'] },
      //       },
      //     },
      //   },
      // ]);
      //
      // // Get the count of similar product purchases
      // const count = await this.productDamageModel.countDocuments({
      //   'product.name': name,
      //   'product.colors._id': colors._id,
      //   'product.sizes._id': sizes._id,
      //   shop: shop,
      //   month: month,
      //   year: year,
      // });
      //
      // // If no similar product purchases are found
      // if (similarProductPurchases.length === 0) {
      //   return {
      //     success: true,
      //     message: 'No similar product purchases found',
      //     calculation: {
      //       _id: null,
      //       totalQuantity: 0,
      //       sumPurchasePrice: 0,
      //       sumSalePrice: 0,
      //     },
      //     count: 0,
      //     data: [],
      //   };
      // }

      // Get the list of similar product purchases
      const productPurchaseData = await this.productDamageModel
        .find({
          'product.name': name,
          'product.colors._id': colors._id,
          'product.sizes._id': sizes._id,
          shop: shop,
          month: month,
          dateString: dateString,
          year: year,
        })
        .exec();

      // Map the productPurchaseData to the desired format
      const purchases = productPurchaseData.map((purchase) => ({
        groupKey: `${purchase.product.name} - ${purchase.product.colors} - ${purchase.product.sizes}`,
        name: purchase.product.name,
        _id: purchase._id,
        sizes: purchase.product.sizes,
        colors: purchase.product.colors,
        previousQuantity: purchase.previousQuantity,
        category: purchase.category,
        quantity: purchase.quantity,
        purchasePrice: purchase.product.purchasePrice,
        totalPurchase: purchase.quantity * purchase.product.purchasePrice,
        salesman: purchase.salesman,
        createTime: purchase.createTime,
        updateTime: purchase.updateTime,
        vendor: purchase.product.vendor,
        dateString: purchase.dateString,
        note: purchase.note || 'N/A',
        imei: purchase.product.imei || 'N/A',
      }));

      // Calculate purchasePriceTotal and totalPurchaseTotal
      const purchasePriceTotal = purchases.reduce(
        (total, purchase) => total + purchase.purchasePrice,
        0,
      );
      const totalPurchaseTotal = purchases.reduce(
        (total, purchase) => total + purchase.totalPurchase,
        0,
      );

      // Return the formatted response
      return {
        success: true,
        message: 'Similar product purchases retrieved successfully',
        date: dateStringDate, // Use today's date as "date"
        purchasePriceTotal, // Total of all purchase prices
        purchases, // List of purchases
        totalPurchaseTotal, // Total of all total purchases
      };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(
        'An error occurred while fetching similar product purchases',
      );
    }
  }

  async getProductDamageById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productDamageModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getProductDamageByDate(
    date: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productDamageModel.find({ date: date });
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

  async getUserProductDamageById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productDamageModel.findById(id);
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
   * updateProductDamageById()
   * updateMultipleProductDamageById()
   */
  async updateProductDamageById(
    id: string,
    updateProductDamageDto: UpdateProductDamageDto,
  ): Promise<ResponsePayload> {
    try {
      const finalData = { ...updateProductDamageDto };

      await this.productDamageModel.findByIdAndUpdate(id, {
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

  async updateMultipleProductDamageById(
    ids: string[],
    updateProductDamageDto: UpdateProductDamageDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.productDamageModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateProductDamageDto },
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
   * deleteProductDamageById()
   * deleteMultipleProductDamageById()
   */
  async deleteProductDamageById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.productDamageModel.findById(id);
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
      await this.productDamageModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleProductDamageById(
    adminId: string,
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      // Fetch the products to log their details before deletion
      const productsToDelete = await this.productDamageModel
        .find({ _id: { $in: mIds } })
        .lean();

      // Perform the deletion
      await this.productDamageModel.deleteMany({ _id: { $in: mIds } });
      const admin = await this.adminModel.findById(adminId);
      const dateString = this.utilsService.getDateString(new Date());
      // Save the deletion logs in the productLog collection
      if (productsToDelete.length > 0) {
        const logs = productsToDelete.map((product) => ({
          ...product, // Include all product fields
          deletedAt: new Date(),
          deletedBy: admin?.name, // Replace with actual user performing the deletion
          deleteMonth: dateString
            ? this.utilsService.getDateMonth(false, new Date(dateString))
            : this.utilsService.getDateMonth(false, new Date()),
          deleteYear: dateString
            ? new Date(dateString).getFullYear()
            : new Date().getFullYear(),
          deleteDateString: dateString
            ? dateString
            : this.utilsService.getDateString(new Date()),
        }));

        await this.outStockLogModel.insertMany(logs); // Save logs
      }
      // await this.productDamageModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
