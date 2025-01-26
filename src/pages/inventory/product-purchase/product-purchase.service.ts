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
  AddProductPurchaseDto,
  FilterAndPaginationProductPurchaseDto,
  UpdateProductPurchaseDto,
} from '../../../dto/product-purchase.dto';
import { ProductPurchase } from 'src/interfaces/common/product-purchase.interface';
import { Category } from '../../../interfaces/common/category.interface';
import { Product } from '../../../interfaces/common/product.interface';
import { Admin } from '../../../interfaces/admin/admin.interface';
import { ProductPurchaseLog } from '../../../interfaces/common/product-purchase-log.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class ProductPurchaseService {
  private logger = new Logger(ProductPurchaseService.name);

  constructor(
    @InjectModel('ProductPurchase')
    private readonly productPurchaseModel: Model<ProductPurchase>,
    private configService: ConfigService,
    private utilsService: UtilsService,
    @InjectModel('Product')
    private readonly productModel: Model<Product>,
    @InjectModel('Admin')
    private readonly adminModel: Model<Admin>,
    @InjectModel('ProductPurchaseLog')
    private readonly productPurchaseLogModel: Model<ProductPurchaseLog>,
  ) {}

  /**
   * ADD DATA
   * addProductPurchase()
   * insertManyProductPurchase()
   */
  async addProductPurchase(
    addProductPurchaseDto: AddProductPurchaseDto,
  ): Promise<ResponsePayload> {
    try {
      const { date } = addProductPurchaseDto;
      const dateString = this.utilsService.getDateString(new Date());
      const mData = {
        ...addProductPurchaseDto,
        dateString,
      };
      const data = new this.productPurchaseModel(mData);
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
   * getAllProductPurchases()
   * getProductPurchaseById()
   * getUserProductPurchaseById()
   */

  async getAllProductPurchaseByShop(
    shop: string,
    filterProductPurchaseDto: FilterAndPaginationProductPurchaseDto,
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
      const { filter } = filterProductPurchaseDto;
      filterProductPurchaseDto.filter = { ...filter, ...{ shop: shop } };

      return this.getAllProductPurchases(filterProductPurchaseDto, searchQuery);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
  async getAllProductPurchases(
    filterProductPurchaseDto: FilterAndPaginationProductPurchaseDto,
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
      const dataAggregates = await this.productPurchaseModel.aggregate(
        aggregateStages,
      );

      const calculateAggregates = await this.productPurchaseModel.aggregate(
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

  async updateMissingProductPurchaseFields(): Promise<ResponsePayload> {
    try {
      const startDate = '2024-12-13';
      const endDate = '2024-12-13';

      const productPurchasesWithMissingFields =
        await this.productPurchaseModel.aggregate([
          // {
          //   $match: {
          //     dateString: { $gte: startDate, $lte: endDate },
          //   },
          // },
          {
            $match: {
              $or: [
                { imei: null },
                { 'product.category': null },
                { salesman: null },
              ],
            },
          },
        ]);

      // console.log(productPurchasesWithMissingFields);

      if (productPurchasesWithMissingFields.length === 0) {
        return {
          success: true,
          message: 'No missing fields found to update.',
        } as ResponsePayload;
      }

      // Step 2: Loop through each product purchase and update missing fields
      for (const purchase of productPurchasesWithMissingFields) {
        const productId = purchase.product?._id;

        if (!productId) {
          continue; // Skip if product._id is not available
        }

        // Step 3: Find product details using product._id
        const productDetails: any = await this.productModel.findById(productId);

        if (productDetails) {
          // Build the update object
          const updateData: any = {};

          if (!purchase.product?.imei) {
            updateData['product.imei'] = productDetails.imei || null; // Add IMEI if missing
          }
          if (!purchase.product?.category) {
            updateData['product.category'] = productDetails.category || null; // Add category if missing
          }
          if (!purchase.salesman) {
            updateData.salesman = productDetails.salesman || null; // Add salesman if missing
          }

          // Step 4: Update the product purchase document
          await this.productPurchaseModel.updateOne(
            { _id: purchase._id },
            { $set: updateData },
          );
        }
      }

      return {
        success: true,
        message: 'Missing fields updated successfully.',
      } as ResponsePayload;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Failed to update missing fields.',
      );
    }
  }

  async getSimilarProductPurchasesByProductId(
    productId: string,
    dateStringDate: string,
  ): Promise<any> {
    try {
      // console.log('productId', productId);

      // Fetch the product purchase record by its ID
      const productPurchase: any = await this.productPurchaseModel
        .findOne({ 'product._id': productId, dateString: dateStringDate })
        .exec();
      console.log('productPurchase', productPurchase);

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

      // Check if the necessary fields exist
      // if (!colors._id || !sizes._id) {
      //   console.error('Missing _id in product fields:', {
      //     category,
      //     colors,
      //     sizes,
      //   }); // Log missing _id
      //   throw new NotFoundException('Category, colors, or sizes _id not found');
      // }

      // // Create the query to find similar product purchases
      // const similarProductPurchases = await this.productPurchaseModel.aggregate(
      //   [
      //     {
      //       $match: {
      //         $and: [
      //           { 'product.name': name }, // Match product name
      //           { 'product.colors._id': colors._id }, // Match colors._id
      //           { 'product.sizes._id': sizes._id }, // Match sizes._id
      //           { shop: shop }, // Match shop._id
      //           { month: month }, // Match the same month
      //           { year: year }, // Match the same year
      //         ],
      //       },
      //     },
      //     {
      //       $group: {
      //         _id: null,
      //         totalQuantity: { $sum: '$updatedQuantity' },
      //         sumPurchasePrice: {
      //           $sum: {
      //             $multiply: ['$updatedQuantity', '$product.purchasePrice'],
      //           },
      //         },
      //         sumSalePrice: {
      //           $sum: { $multiply: ['$updatedQuantity', '$product.salePrice'] },
      //         },
      //       },
      //     },
      //   ],
      // );
      //
      // // Get the count of similar product purchases
      // const count = await this.productPurchaseModel.countDocuments({
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
      const productPurchaseData = await this.productPurchaseModel
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
        category: purchase.product.category,
        previousQuantity: purchase.previousQuantity,
        updatedQuantity: purchase.updatedQuantity,
        purchasePrice: purchase.product.purchasePrice,
        totalPurchase:
          purchase.updatedQuantity * purchase.product.purchasePrice,
        salesman: purchase.salesman,
        createTime: purchase.createTime,
        vendor: purchase.product.vendor,
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

  async getProductPurchaseById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productPurchaseModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getProductPurchaseByDate(
    date: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productPurchaseModel.find({ date: date });
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

  async getUserProductPurchaseById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productPurchaseModel.findById(id);
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
   * updateProductPurchaseById()
   * updateMultipleProductPurchaseById()
   */
  async updateProductPurchaseById(
    id: string,
    updateProductPurchaseDto: UpdateProductPurchaseDto,
  ): Promise<ResponsePayload> {
    try {
      const finalData = { ...updateProductPurchaseDto };

      await this.productPurchaseModel.findByIdAndUpdate(id, {
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

  async updateMultipleProductPurchaseById(
    ids: string[],
    updateProductPurchaseDto: UpdateProductPurchaseDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.productPurchaseModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateProductPurchaseDto },
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
   * deleteProductPurchaseById()
   * deleteMultipleProductPurchaseById()
   */
  async deleteProductPurchaseById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.productPurchaseModel.findById(id);
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
      await this.productPurchaseModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleProductPurchaseById(
    adminId: string,
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      // Fetch the products to log their details before deletion
      const productsToDelete = await this.productPurchaseModel
        .find({ _id: { $in: mIds } })
        .lean();

      // Perform the deletion
      await this.productPurchaseModel.deleteMany({ _id: { $in: mIds } });

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
        console.log('logs', logs);

        await this.productPurchaseLogModel.insertMany(logs); // Save logs
      }
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
