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
import { UtilsService } from '../../../shared/utils/utils.service';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { ErrorCodes } from '../../../enum/error-code.enum';
import {
  AddProductDto,
  FilterAndPaginationProductDto,
  UpdateProductDto,
} from '../../../dto/product.dto';
import { Product } from 'src/interfaces/common/product.interface';
import { SubCategory } from '../../../interfaces/common/sub-category.interface';
import { Brand } from '../../../interfaces/common/brand.interface';
import { UniqueId } from 'src/interfaces/core/unique-id.interface';
import { Unit } from 'src/interfaces/common/unit.interface';
import { Category } from 'src/interfaces/common/category.interface';
import { ProductPurchase } from '../../../interfaces/common/product-purchase.interface';
import { ProductDamage } from '../../../interfaces/common/product-damage.interface';
import { ProductLog } from '../../../interfaces/common/product-log.interface';
import { Admin } from '../../../interfaces/admin/admin.interface';
import * as schedule from 'node-schedule';
import * as moment from 'moment';
const ObjectId = Types.ObjectId;

@Injectable()
export class ProductService {
  private logger = new Logger(ProductService.name);

  constructor(
    @InjectModel('Product')
    private readonly productModel: Model<Product>,
    @InjectModel('Category')
    private readonly categoryModel: Model<Category>,
    @InjectModel('SubCategory')
    private readonly SubCategoryModel: Model<SubCategory>,
    @InjectModel('Brand')
    private readonly brandModel: Model<Brand>,
    @InjectModel('ProductLog')
    private readonly productLogModel: Model<ProductLog>,
    @InjectModel('Unit')
    private readonly unitModel: Model<Unit>,
    @InjectModel('UniqueId')
    private readonly uniqueIdModel: Model<UniqueId>,
    @InjectModel('Admin')
    private readonly adminModel: Model<Admin>,
    @InjectModel('ProductPurchase')
    private readonly productPurchaseModel: Model<ProductPurchase>,
    @InjectModel('ProductDamage')
    private readonly productDamageModel: Model<ProductDamage>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {
    this.checkRequestEveryday();
  }

  /**
   * ADD DATA
   * addProduct()
   * insertManyProduct()
   */
  async addProduct(
    shop: string,
    addProductDto: AddProductDto,
  ): Promise<ResponsePayload> {
    try {
      const { sku, dateString, imei } = addProductDto;

      // Check if SKU already exists
      // if (sku) {
      //   const hasData = await this.productModel.findOne({ sku: sku });
      //   if (hasData) {
      //     return {
      //       success: false,
      //       message: 'Code Error! Code must be unique.',
      //       data: null,
      //     } as ResponsePayload;
      //   }
      // }

      const createdAtString = this.utilsService.getDateString(new Date());

      // If IMEI is provided, handle IMEI-wise product addition
      if (imei && imei.trim().length > 0) {
        const imeiList = imei.split(',').map((value) => value.trim());

        // Check for existing IMEI in the database
        for (const imeiValue of imeiList) {
          const existingProduct = await this.productModel.findOne({
            imei: imeiValue,
            shop,
          });
          if (existingProduct) {
            return {
              success: false,
              message: `Product with IMEI ${imeiValue} already exists.`,
              data: null,
            } as ResponsePayload;
          }
        }

        // Response payload for all created IMEI products
        const responsePayloadData: any[] = [];

        for (const imeiValue of imeiList) {
          const incOrder = await this.uniqueIdModel.findOneAndUpdate(
            { shop: shop },
            { $inc: { productId: 1 } },
            { new: true, upsert: true },
          );

          const productIdUnique = this.utilsService.padLeadingZeros(
            incOrder.productId,
          );

          const dataExtra = {
            productId: productIdUnique,
            createdAtString: createdAtString,
            soldQuantity: 0,
            imei: imeiValue, // Assign IMEI to the product
          };

          const mData = {
            ...addProductDto,
            ...dataExtra,
            shop,
          };

          const data = new this.productModel(mData);
          const saveData = await data.save();

          const purchaseData = {
            product: {
              _id: saveData._id,
              name: `${addProductDto.name}${
                addProductDto.colors ? ' - ' + addProductDto.colors.name : ''
              }${addProductDto.sizes ? ' - ' + addProductDto.sizes.name : ''}`,
              sku: addProductDto.sku || null,
              others: addProductDto.others || null,
              model: addProductDto.model || null,
              salePrice: addProductDto.salePrice || null,
              purchasePrice: addProductDto.purchasePrice || null,
              colors: addProductDto.colors || null,
              sizes: addProductDto.sizes || null,
              shop,
              vendor: addProductDto.vendor,
              category: addProductDto.category,
              imei: imeiValue,
              salesman: addProductDto.salesman,
              dateString: addProductDto.dateString,
              createdAtString: addProductDto.createdAtString,
              createTime: addProductDto.createTime,
            },
            month: dateString
              ? this.utilsService.getDateMonth(false, new Date(dateString))
              : this.utilsService.getDateMonth(false, new Date()),
            year: dateString
              ? new Date(dateString).getFullYear()
              : new Date().getFullYear(),
            previousQuantity: 0,
            updatedQuantity: addProductDto.quantity,
            createdAtString: this.utilsService.getDateString(new Date()),
            createTime: addProductDto.createTime,
            dateString: dateString
              ? dateString
              : this.utilsService.getDateString(new Date()),
            salesman: addProductDto.salesman,
            shop,
          };

          await new this.productPurchaseModel(purchaseData).save();

          responsePayloadData.push({
            _id: saveData._id,
            imei: imeiValue,
          });
        }

        return {
          success: true,
          message: 'Success! Products added for each IMEI.',
          data: responsePayloadData,
        } as ResponsePayload;
      }

      // If IMEI is not provided, add a single product
      const incOrder = await this.uniqueIdModel.findOneAndUpdate(
        { shop: shop },
        { $inc: { productId: 1 } },
        { new: true, upsert: true },
      );

      const productIdUnique = this.utilsService.padLeadingZeros(
        incOrder.productId,
      );

      const dataExtra = {
        productId: productIdUnique,
        createdAtString: createdAtString,
        soldQuantity: 0,
      };

      const mData = {
        ...addProductDto,
        ...dataExtra,
        shop,
      };

      const data = new this.productModel(mData);
      const saveData = await data.save();

      const purchaseData = {
        product: {
          _id: saveData._id,
          name: `${addProductDto.name}${
            addProductDto.colors ? ' - ' + addProductDto.colors.name : ''
          }${addProductDto.sizes ? ' - ' + addProductDto.sizes.name : ''}`,
          sku: addProductDto.sku || null,
          others: addProductDto.others || null,
          model: addProductDto.model || null,
          salePrice: addProductDto.salePrice || null,
          purchasePrice: addProductDto.purchasePrice || null,
          colors: addProductDto.colors || null,
          sizes: addProductDto.sizes || null,
          shop,
          vendor: addProductDto.vendor,
          category: addProductDto.category,
          imei: null, // No IMEI for single product
          salesman: addProductDto.salesman,
          dateString: addProductDto.dateString,
          createdAtString: addProductDto.createdAtString,
          createTime: addProductDto.createTime,
        },
        month: dateString
          ? this.utilsService.getDateMonth(false, new Date(dateString))
          : this.utilsService.getDateMonth(false, new Date()),
        year: dateString
          ? new Date(dateString).getFullYear()
          : new Date().getFullYear(),
        previousQuantity: 0,
        updatedQuantity: addProductDto.quantity,
        createdAtString: this.utilsService.getDateString(new Date()),
        createTime: addProductDto.createTime,
        dateString: dateString
          ? dateString
          : this.utilsService.getDateString(new Date()),
        salesman: addProductDto.salesman,
        shop,
      };

      await new this.productPurchaseModel(purchaseData).save();

      return {
        success: true,
        message: 'Success! Single product added.',
        data: { _id: saveData._id },
      } as ResponsePayload;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * ADD DATA
   * addProduct()
   * insertManyProduct()
   */
  async addReturnProduct(
    shop: string,
    addProductDto: AddProductDto,
  ): Promise<ResponsePayload> {
    try {
      const { sku, dateString, imei } = addProductDto;

      // Check if SKU already exists
      // if (sku) {
      //   const hasData = await this.productModel.findOne({ sku: sku });
      //   if (hasData) {
      //     return {
      //       success: false,
      //       message: 'Code Error! Code must be unique.',
      //       data: null,
      //     } as ResponsePayload;
      //   }
      // }

      const createdAtString = this.utilsService.getDateString(new Date());

      // If IMEI is provided, handle IMEI-wise product addition
      if (imei && imei.trim().length > 0) {
        const imeiList = imei.split(',').map((value) => value.trim());

        // Check for existing IMEI in the database
        for (const imeiValue of imeiList) {
          const existingProduct = await this.productModel.findOne({
            imei: imeiValue,
            shop,
          });
          if (existingProduct) {
            return {
              success: false,
              message: `Product with IMEI ${imeiValue} already exists.`,
              data: null,
            } as ResponsePayload;
          }
        }

        // Response payload for all created IMEI products
        const responsePayloadData: any[] = [];

        for (const imeiValue of imeiList) {
          const incOrder = await this.uniqueIdModel.findOneAndUpdate(
            { shop: shop },
            { $inc: { productId: 1 } },
            { new: true, upsert: true },
          );

          const productIdUnique = this.utilsService.padLeadingZeros(
            incOrder.productId,
          );

          const dataExtra = {
            productId: productIdUnique,
            createdAtString: createdAtString,
            soldQuantity: 0,
            imei: imeiValue, // Assign IMEI to the product
          };

          const mData = {
            ...addProductDto,
            ...dataExtra,
            shop,
          };

          const data = new this.productModel(mData);
          const saveData = await data.save();

          const purchaseData = {
            product: {
              _id: saveData._id,
              name: `${addProductDto.name}${
                addProductDto.colors ? ' - ' + addProductDto.colors.name : ''
              }${addProductDto.sizes ? ' - ' + addProductDto.sizes.name : ''}`,
              sku: addProductDto.sku || null,
              others: addProductDto.others || null,
              model: addProductDto.model || null,
              salePrice: addProductDto.salePrice || null,
              purchasePrice: addProductDto.purchasePrice || null,
              colors: addProductDto.colors || null,
              sizes: addProductDto.sizes || null,
              shop,
              vendor: addProductDto.vendor,
              category: addProductDto.category,
              imei: imeiValue,
              salesman: addProductDto.salesman,
              dateString: addProductDto.dateString,
              createdAtString: addProductDto.createdAtString,
              createTime: addProductDto.createTime,
            },
            month: dateString
              ? this.utilsService.getDateMonth(false, new Date(dateString))
              : this.utilsService.getDateMonth(false, new Date()),
            year: dateString
              ? new Date(dateString).getFullYear()
              : new Date().getFullYear(),
            previousQuantity: 0,
            updatedQuantity: addProductDto.quantity,
            createdAtString: this.utilsService.getDateString(new Date()),
            createTime: addProductDto.createTime,
            dateString: dateString
              ? dateString
              : this.utilsService.getDateString(new Date()),
            salesman: addProductDto.salesman,
            shop,
          };

          await new this.productPurchaseModel(purchaseData).save();

          responsePayloadData.push({
            _id: saveData._id,
            imei: imeiValue,
          });
        }

        return {
          success: true,
          message: 'Success! Products added for each IMEI.',
          data: responsePayloadData,
        } as ResponsePayload;
      }

      // If IMEI is not provided, add a single product
      const incOrder = await this.uniqueIdModel.findOneAndUpdate(
        { shop: shop },
        { $inc: { productId: 1 } },
        { new: true, upsert: true },
      );

      const productIdUnique = this.utilsService.padLeadingZeros(
        incOrder.productId,
      );

      const dataExtra = {
        productId: productIdUnique,
        createdAtString: createdAtString,
        soldQuantity: 0,
      };

      const mData = {
        ...addProductDto,
        ...dataExtra,
        shop,
      };

      const data = new this.productModel(mData);
      const saveData = await data.save();

      const purchaseData = {
        product: {
          _id: saveData._id,
          name: `${addProductDto.name}${
            addProductDto.colors ? ' - ' + addProductDto.colors.name : ''
          }${addProductDto.sizes ? ' - ' + addProductDto.sizes.name : ''}`,
          sku: addProductDto.sku || null,
          others: addProductDto.others || null,
          model: addProductDto.model || null,
          salePrice: addProductDto.salePrice || null,
          purchasePrice: addProductDto.purchasePrice || null,
          colors: addProductDto.colors || null,
          sizes: addProductDto.sizes || null,
          shop,
          vendor: addProductDto.vendor,
          category: addProductDto.category,
          imei: null, // No IMEI for single product
          salesman: addProductDto.salesman,
          dateString: addProductDto.dateString,
          createdAtString: addProductDto.createdAtString,
          createTime: addProductDto.createTime,
        },
        month: dateString
          ? this.utilsService.getDateMonth(false, new Date(dateString))
          : this.utilsService.getDateMonth(false, new Date()),
        year: dateString
          ? new Date(dateString).getFullYear()
          : new Date().getFullYear(),
        previousQuantity: 0,
        updatedQuantity: addProductDto.quantity,
        createdAtString: this.utilsService.getDateString(new Date()),
        createTime: addProductDto.createTime,
        dateString: dateString
          ? dateString
          : this.utilsService.getDateString(new Date()),
        salesman: addProductDto.salesman,
        shop,
      };

      await new this.productPurchaseModel(purchaseData).save();

      return {
        success: true,
        message: 'Success! Single product added.',
        data: { _id: saveData._id },
      } as ResponsePayload;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async insertManyProduct(
    shop: string,
    addProductsDto: AddProductDto[],
  ): Promise<ResponsePayload> {
    try {
      for (let i = 0; i < addProductsDto.length; i++) {
        addProductsDto[i].createdAtString = this.utilsService.getDateString(
          new Date(),
        );
        if (addProductsDto[i].category) {
          const category = await this.categoryModel.findOne({
            name: { $regex: addProductsDto[i].category, $options: 'i' },
          });

          if (category) {
            addProductsDto[i].category = {
              _id: category._id,
              name: category.name,
            };
          } else {
            const newCatSchema = new this.categoryModel({
              name: addProductsDto[i].category,
            });
            const newCat = await newCatSchema.save();
            addProductsDto[i].category = {
              _id: newCat._id,
              name: newCat.name,
            };
          }
        }

        const incOrder = await this.uniqueIdModel.findOneAndUpdate(
          { shop: shop },
          { $inc: { productId: 1 } },
          { new: true, upsert: true },
        );
        addProductsDto[i].productId = this.utilsService.padLeadingZeros(
          incOrder.productId,
        );
        addProductsDto[i].soldQuantity = 0;
      }

      await this.productModel.insertMany(addProductsDto);

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
   * getAllProducts()
   * getProductById()
   * getUserProductById()
   */

  async getAllProductByShop(
    shop: string,
    filterProductDto: FilterAndPaginationProductDto,
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
      const { filter } = filterProductDto;
      filterProductDto.filter = { ...filter, ...{ shop: shop } };

      return this.getAllProducts(filterProductDto, searchQuery);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllGroupProductByShop(
    shop: string,
    filterProductDto: FilterAndPaginationProductDto,
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
      const { filter } = filterProductDto;
      filterProductDto.filter = { ...filter, ...{ shop: shop } };

      return this.getAllProductsV2(filterProductDto, searchQuery);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateAllProductNames(): Promise<{ updatedCount: number }> {
    // Fetch all products
    const products = await this.productModel.find();

    // Counter for updated products
    let updatedCount = 0;

    // Iterate over each product and trim the name
    for (const product of products) {
      const trimmedName = product.name.trim();
      if (product.name !== trimmedName) {
        await this.productModel.findByIdAndUpdate(product._id, {
          name: trimmedName,
        });
        updatedCount++;
      }
    }

    return { updatedCount };
  }

  async updateAllCategoryNames(): Promise<{ updatedCount: number }> {
    // Fetch all products
    const products = await this.productModel.find();

    // Counter for updated products
    let updatedCount = 0;

    // Iterate over each product and trim the category name if it exists
    for (const product of products) {
      if (product.category && product.category.name) {
        const trimmedCategoryName = product.category.name.trim();
        if (product.category.name !== trimmedCategoryName) {
          // Update the nested category.name
          await this.productModel.findByIdAndUpdate(product._id, {
            'category.name': trimmedCategoryName,
          });
          updatedCount++;
        }
      }
    }

    return { updatedCount };
  }

  async getAllProductsV2(
    filterProductDto: FilterAndPaginationProductDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterProductDto;
    const { pagination } = filterProductDto;
    const { sort } = filterProductDto;
    const { select } = filterProductDto;

    // Essential Variables
    const aggregateStages = [];

    // Calculations
    const aggregateStagesCalculation = [];

    let mFilter = {};
    let mSort = {};
    const mSelect = {};
    const mPagination = {};

    // this.updateAllProductNames();
    // this.updateAllCategoryNames();

    // Match Filter
    if (filter) {
      if (filter['shop']) {
        filter['shop'] = new ObjectId(filter['shop']);
      }
      if (filter['category.name']) {
        const categoryNameVariations = [
          filter['category.name'],
          filter['category.name'].trim(),
          // `${filter['category.name']}`,
          // ` ${filter['category.name']} `,
          // ` ${filter['category.name']}`,
          // `  ${filter['category.name']}  `,
          // `${filter['category.name']} `,
          // `  ${filter['category.name']}  `,
          // `  ${filter['category.name']}`,
          // `  ${filter['category.name']} `,
          // `${filter['category.name']}  `,
          // ` ${filter['category.name']}  `,
        ];
        filter['category.name'] = { $in: categoryNameVariations };
      }
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

      mFilter = { ...filter };

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
              ],
            },
          ],
        };
      }

      // mFilter = {
      //   ...mFilter,
      //   quantity: { $gt: 0 },
      // };
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

    // Match Stage
    if (Object.keys(mFilter).length) {
      aggregateStages.push({ $match: mFilter });
      // aggregateStagesCalculation.push({ $match: mFilter });
    }

    // Conditional Grouping
    aggregateStages.push({
      $group: {
        _id: {
          $cond: {
            if: {
              $and: [
                { $ifNull: ['$category', false] }, // Check if category exists
                { $ifNull: ['$name', false] }, // Check if name exists
                { $ifNull: ['$colors', false] }, // Check if colors exist
                { $ifNull: ['$sizes', false] }, // Check if sizes exist
              ],
            },
            then: {
              category: '$category',
              name: '$name',
              colors: '$colors',
              sizes: '$sizes',
            },
            else: { _id: '$_id' }, // Group by _id if conditions fail
          },
        },
        name: { $first: '$name' },
        category: { $first: '$category' },
        colors: { $first: '$colors' },
        sizes: { $first: '$sizes' },
        firstProductId: { $first: '$_id' },
        quantity: { $sum: { $ifNull: ['$quantity', 0] } }, // Summing quantities
        imei: { $first: '$imei' }, // Taking the first imei
        purchasePrice: { $first: '$purchasePrice' }, // Average purchase price
        salePrice: { $first: '$salePrice' }, // Average sale price
        createdAtString: { $first: '$createdAtString' }, // First createdAtString
      },
    });

    // Flattening Grouped Data
    aggregateStages.push({
      $project: {
        _id: 0,
        category: 1,
        name: 1,
        colors: 1,
        sizes: 1,
        quantity: 1,
        imei: 1,
        firstProductId: 1,
        purchasePrice: 1,
        salePrice: 1,
        createdAtString: 1,
      },
    });

    // Sort Stage
    if (sort) {
      mSort = sort;
    } else {
      mSort = { createdAtString: -1 };
    }
    aggregateStages.push({ $sort: mSort });

    // Pagination
    if (pagination) {
      aggregateStages.push({
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: pagination.pageSize * pagination.currentPage },
            { $limit: pagination.pageSize },
          ],
        },
      });

      aggregateStages.push({
        $project: {
          data: 1,
          count: { $arrayElemAt: ['$metadata.total', 0] },
        },
      });
    } else {
      // If pagination is null, return all products
      aggregateStages.push({
        $project: {
          _id: 1,
          category: 1,
          name: 1,
          colors: 1,
          sizes: 1,
          quantity: 1,
          imei: 1,
          firstProductId: 1,
          purchasePrice: 1,
          salePrice: 1,
          createdAtString: 1,
        },
      });
    }

    try {
      const result = await this.productModel.aggregate(aggregateStages);

      const calculateAggregates = await this.productModel.aggregate(
        aggregateStagesCalculation,
      );

      // When pagination is used, 'result' is an array, with the first element containing the data
      const products = pagination ? result[0].data : result;

      const firstProductId = products.length > 0 ? products[0]._id : null;

      // console.log(firstProductId);

      // Calculate total data
      const calculation = products.reduce(
        (acc, product) => {
          acc.totalQuantity += product.quantity;
          acc.sumPurchasePrice += product.purchasePrice * product.quantity;
          acc.sumSalePrice += product.salePrice * product.quantity;
          acc.totalPurchasePrice += product.purchasePrice * product.quantity;
          acc.totalSalePrice += product.salePrice * product.quantity;

          return acc;
        },
        {
          totalQuantity: 0,
          sumPurchasePrice: 0,
          sumSalePrice: 0,
          totalPurchasePrice: 0,
          totalSalePrice: 0,
        },
      );

      return pagination
        ? {
            data: products,
            success: true,
            message: 'Success',
            count: result[0].count,
            calculation: {
              ...calculation,
              totalQuantity: calculation.totalQuantity,
              sumPurchasePrice: calculation.sumPurchasePrice,
              sumSalePrice: calculation.sumSalePrice,
              totalPurchasePrice: calculation.totalPurchasePrice,
              totalSalePrice: calculation.totalSalePrice,
              calculation: calculateAggregates[0],
            },
          }
        : {
            data: products,
            success: true,
            message: 'Success',
            count: products.length,
            calculation: {
              ...calculation,
              totalQuantity: calculation.totalQuantity,
              sumPurchasePrice: calculation.sumPurchasePrice,
              sumSalePrice: calculation.sumSalePrice,
              totalPurchasePrice: calculation.totalPurchasePrice,
              totalSalePrice: calculation.totalSalePrice,
              calculation: calculateAggregates[0],
            },
          };
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('An error occurred');
    }
  }

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

      // if (searchQuery) {
      //   // Convert search query to regex format to handle spaces
      //   const regexQuery = searchQuery.split(/\s+/).join('.*'); // "test product" => "test.*product"
      //   mFilter = {
      //     $and: [
      //       mFilter,
      //       {
      //         $or: [
      //           { name: { $regex: regexQuery, $options: 'i' } }, // Handles "testproduct" and "test product"
      //           { imei: { $regex: searchQuery } },
      //           { sku: { $regex: searchQuery } },
      //           { batchNumber: { $regex: searchQuery } },
      //         ],
      //       },
      //     ],
      //   };
      // }

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
      const dataAggregates = await this.productModel.aggregate(aggregateStages);

      const calculateAggregates = await this.productModel.aggregate(
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
  async getSimilarProductsByProductId(shop, productId: string): Promise<any> {
    try {
      // console.log('shop', shop);
      // Fetch the product by its ID
      const product = await this.productModel.findById(productId).exec();

      // If product not found, throw an exception
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Extract product details

      const { category, name, colors, sizes } = product;
      // Create the query to find similar products
      const similarProducts = await this.productModel.aggregate([
        {
          // Match products based on category, name, colors, and sizes
          $match: {
            $and: [
              { 'category._id': category._id }, // Match category._id
              { name: name }, // Match product name
              { 'colors._id': colors._id }, // Match colors._id
              { 'sizes._id': sizes._id }, // Match sizes._id
              { shop: new ObjectId(shop) }, // shop
            ],
          },
        },
        {
          // Grouping to calculate total and sum
          $group: {
            _id: null, // Grouping all similar products together
            totalQuantity: { $sum: '$quantity' },
            sumPurchasePrice: { $sum: '$purchasePrice' },
            sumSalePrice: { $sum: '$salePrice' },
            totalPurchasePrice: {
              $sum: { $multiply: ['$quantity', '$purchasePrice'] },
            },
            totalSalePrice: {
              $sum: { $multiply: ['$quantity', '$salePrice'] },
            },
          },
        },
      ]);

      // Get the count of similar products
      const count = await this.productModel.countDocuments({
        'category._id': category._id,
        name: name,
        'colors._id': colors._id,
        'sizes._id': sizes._id,
        shop: new ObjectId(shop),
      });

      // If no similar products are found
      if (similarProducts.length === 0) {
        return {
          success: true,
          message: 'No similar products found',
          calculation: {
            _id: null,
            totalQuantity: 0,
            sumPurchasePrice: 0,
            sumSalePrice: 0,
            totalPurchasePrice: 0,
            totalSalePrice: 0,
          },
          count: 0,
          data: [],
        };
      }

      // Get the list of similar products
      const productData = await this.productModel
        .find({
          'category._id': category._id,
          name: name,
          'colors._id': colors._id,
          'sizes._id': sizes._id,
          shop: new ObjectId(shop),
        })
        .exec();

      // Return the full response with calculation, count, and data
      return {
        success: true,
        message: 'Similar products retrieved successfully',
        calculation: similarProducts[0], // Aggregated summary
        count: count, // Number of similar products
        data: productData, // List of similar products
      };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(
        'An error occurred while fetching similar products',
      );
    }
  }

  async getProductById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.productModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getProductByName(
    name: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productModel.find({ name: name });
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

  async getUserProductById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productModel.findById(id);
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
   * updateProductById()
   * updateMultipleProductById()
   */
  async updateProductById(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ResponsePayload> {
    try {
      const { dateString, newQuantity } = updateProductDto;
      const createdAtString = this.utilsService.getDateString(new Date());
      let mData = {
        ...updateProductDto,
        ...{
          createdAtString: createdAtString,
        },
      };

      // console.log('updateProductDto5',updateProductDto);

      const previousProductData: Product = JSON.parse(
        JSON.stringify(await this.productModel.findById(id)),
      );

      // console.log('updateProductDto5',updateProductDto);
      if (newQuantity) {
        const totalQuantity = previousProductData.quantity + newQuantity;
        mData = {
          ...mData,
          ...{
            quantity: totalQuantity,
          },
        };
      }

      await this.productModel.findByIdAndUpdate(id, {
        $set: mData,
      });

      if (newQuantity) {
        const purchaseData = {
          product: {
            _id: id,
            name: `${updateProductDto.name}${
              updateProductDto.colors
                ? ' - ' + updateProductDto.colors.name
                : ''
            }${
              updateProductDto.sizes ? ' - ' + updateProductDto.sizes.name : ''
            }`,
            sku: updateProductDto.sku || null,
            others: updateProductDto.others || null,
            model: updateProductDto.model || null,
            salePrice: updateProductDto.salePrice || null,
            purchasePrice: updateProductDto.purchasePrice || null,
            imei: updateProductDto.imei || null,
            shop: previousProductData.shop,
            colors: previousProductData.colors,
            sizes: previousProductData.sizes,
            vendor: previousProductData.vendor,
            category: previousProductData.category,
            salesman: updateProductDto.salesman,
            dateString: updateProductDto.dateString,
            createdAtString: updateProductDto.createdAtString,
            createTime: updateProductDto.createTime,
            note: updateProductDto.note,
          },
          month: dateString
            ? this.utilsService.getDateMonth(false, new Date(dateString))
            : this.utilsService.getDateMonth(false, new Date()),
          year: dateString
            ? new Date(dateString).getFullYear()
            : new Date().getFullYear(),
          previousQuantity: previousProductData.quantity,
          updatedQuantity: newQuantity,
          createdAtString: this.utilsService.getDateString(new Date()),
          dateString: dateString
            ? dateString
            : this.utilsService.getDateString(new Date()),
          createTime: updateProductDto.createTime,
          note: updateProductDto.note ?? null,
          quantity: mData.newQuantity,
          salesman: updateProductDto['salesman'],
          shop: previousProductData.shop,
        };

        await new this.productPurchaseModel(purchaseData).save();
        // await this.productDamageModel.create(purchaseData);
      }

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      console.log('err', err);
      throw new InternalServerErrorException();
    }
  }
  // async updateProductById(
  //   shop: any,
  //   id: string,
  //   updateProductDto: UpdateProductDto,
  // ): Promise<ResponsePayload> {
  //   try {
  //     console.log('shop', shop);
  //     const { imei, newQuantity, dateString } = updateProductDto;
  //     const createdAtString = this.utilsService.getDateString(new Date());
  //     const responsePayloadData: any[] = [];
  //
  //     if (imei && imei.trim().length > 0) {
  //       const imeiList = imei.split(',').map((value) => value.trim());
  //
  //       for (const imeiValue of imeiList) {
  //         const existingProduct = await this.productModel.findOne({
  //           imei: imeiValue,
  //           shop,
  //         });
  //
  //         if (existingProduct) {
  //           if (newQuantity) {
  //             // Do not update; add as a new product
  //             const incOrder = await this.uniqueIdModel.findOneAndUpdate(
  //               { shop },
  //               { $inc: { productId: 1 } },
  //               { new: true, upsert: true },
  //             );
  //
  //             const productIdUnique = this.utilsService.padLeadingZeros(
  //               incOrder.productId,
  //             );
  //
  //             const newProductData = {
  //               ...updateProductDto,
  //               imei: imeiValue,
  //               productId: productIdUnique,
  //               createdAtString,
  //               soldQuantity: 0,
  //             };
  //
  //             const newProduct = new this.productModel(newProductData);
  //             const savedProduct = await newProduct.save();
  //
  //             // Add purchase history
  //             await this.addPurchaseHistory(
  //               savedProduct,
  //               newQuantity,
  //               shop,
  //               dateString,
  //             );
  //
  //             responsePayloadData.push({
  //               action: 'added',
  //               _id: savedProduct._id,
  //               imei: imeiValue,
  //             });
  //           } else {
  //             // Update the existing product
  //             const updatedData = {
  //               ...updateProductDto,
  //               updatedAt: new Date(),
  //             };
  //             const updatedProduct = await this.productModel.findByIdAndUpdate(
  //               existingProduct._id,
  //               { $set: updatedData },
  //               { new: true },
  //             );
  //
  //             responsePayloadData.push({
  //               action: 'updated',
  //               _id: updatedProduct._id,
  //               imei: imeiValue,
  //             });
  //           }
  //         } else {
  //           // Add a new product if it doesn't exist
  //           const incOrder = await this.uniqueIdModel.findOneAndUpdate(
  //             { shop },
  //             { $inc: { productId: 1 } },
  //             { new: true, upsert: true },
  //           );
  //
  //           const productIdUnique = this.utilsService.padLeadingZeros(
  //             incOrder.productId,
  //           );
  //
  //           const newProductData = {
  //             ...updateProductDto,
  //             imei: imeiValue,
  //             productId: productIdUnique,
  //             createdAtString,
  //             soldQuantity: 0,
  //             shop,
  //           };
  //
  //           const newProduct = new this.productModel(newProductData);
  //           const savedProduct = await newProduct.save();
  //
  //           // Add purchase history
  //           await this.addPurchaseHistory(
  //             savedProduct,
  //             newQuantity,
  //             shop,
  //             dateString,
  //           );
  //
  //           responsePayloadData.push({
  //             action: 'added',
  //             _id: savedProduct._id,
  //             imei: imeiValue,
  //           });
  //         }
  //       }
  //     } else {
  //       // Handle non-IMEI products
  //       const existingProduct = await this.productModel.findOne({
  //         shop,
  //         _id: id,
  //       });
  //
  //       if (existingProduct) {
  //         // Update the product
  //         const updatedData = {
  //           ...updateProductDto,
  //           updatedAt: new Date(),
  //         };
  //         const updatedProduct = await this.productModel.findByIdAndUpdate(
  //           existingProduct._id,
  //           { $set: updatedData },
  //           { new: true },
  //         );
  //
  //         // If `newQuantity` is provided, add purchase history
  //         if (newQuantity) {
  //           await this.addPurchaseHistory(
  //             updatedProduct,
  //             newQuantity,
  //             shop,
  //             dateString,
  //           );
  //         }
  //
  //         responsePayloadData.push({
  //           action: 'updated',
  //           _id: updatedProduct._id,
  //         });
  //       } else {
  //         return {
  //           success: false,
  //           message: 'Non-IMEI product not found for update.',
  //           data: null,
  //         } as ResponsePayload;
  //       }
  //     }
  //
  //     return {
  //       success: true,
  //       message: 'Operation completed successfully.',
  //       data: responsePayloadData,
  //     } as ResponsePayload;
  //   } catch (err) {
  //     console.error('Error:', err);
  //     throw new InternalServerErrorException();
  //   }
  // }
  //
  // private async addPurchaseHistory(
  //   product: any,
  //   quantity: number,
  //   shop: string,
  //   dateString?: string,
  // ) {
  //   const purchaseData = {
  //     product: {
  //       _id: product?._id,
  //       name: `${product?.name}${
  //         product?.colors ? ' - ' + product?.colors.name : ''
  //       }${product?.sizes ? ' - ' + product?.sizes.name : ''}`,
  //       sku: product?.sku || null,
  //       others: product?.others || null,
  //       model: product?.model || null,
  //       salePrice: product?.salePrice || null,
  //       purchasePrice: product?.purchasePrice || null,
  //       imei: product?.imei || null,
  //       shop: product?.shop,
  //       colors: product?.colors,
  //       sizes: product?.sizes,
  //       vendor: product?.vendor,
  //       category: product?.category,
  //       salesman: product?.salesman,
  //       dateString: product?.dateString,
  //       createdAtString: product?.createdAtString,
  //       createTime: product?.createTime,
  //       note: product?.note,
  //     },
  //     month: dateString
  //       ? this.utilsService.getDateMonth(false, new Date(dateString))
  //       : this.utilsService.getDateMonth(false, new Date()),
  //     year: dateString
  //       ? new Date(dateString).getFullYear()
  //       : new Date().getFullYear(),
  //     previousQuantity: product?.quantity,
  //     updatedQuantity: quantity,
  //     createdAtString: this.utilsService.getDateString(new Date()),
  //     dateString: dateString
  //       ? dateString
  //       : this.utilsService.getDateString(new Date()),
  //     createTime: product?.createTime,
  //     note: product?.note ?? null,
  //     quantity: quantity,
  //     salesman: product['salesman'],
  //     shop: shop,
  //   };
  //
  //   console.log('purchaseData',purchaseData);
  //
  //   await new this.productPurchaseModel(purchaseData).save();
  // }

  async updateMultipleProductById(
    ids: string[],
    updateProductDto: UpdateProductDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.productModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateProductDto },
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
   * deleteProductById()
   * deleteMultipleProductById()
   */
  async deleteProductById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.productModel.findById(id);
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
      await this.productModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleProductById(
    adminId: string,
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      // Fetch the products to log their details before deletion
      const productsToDelete = await this.productModel
        .find({ _id: { $in: mIds } })
        .lean();

      // Perform the deletion
      await this.productModel.deleteMany({ _id: { $in: mIds } });
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

        await this.productLogModel.insertMany(logs); // Save logs
      }
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
  private async checkRequestEveryday() {
    // Corn Job Helper -> https://cron.help/
    // schedule.scheduleJob('*/1 * * * *', async () => {
    schedule.scheduleJob('30 3 * * *', async () => {
      // console.log('Check Request From Db...');
      await this.deleteOldProducts();
    });
  }

  // Function to delete products older than one month
  private async deleteOldProducts() {
    const oneMonthAgo = moment().subtract(1, 'month').format('YYYY-MM-DD');

    try {
      const result = await this.productModel.deleteMany({
        quantity: 0,
        dateString: { $lt: oneMonthAgo },
      });
      console.log(`${result.deletedCount} product(s) deleted.`);
    } catch (error) {
      console.error('Error deleting old products:', error);
    }
  }
}
