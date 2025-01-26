import { UniqueId } from 'src/interfaces/core/unique-id.interface';
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
  AddSalesDto,
  FilterAndPaginationSalesDto,
  UpdateSalesDto,
} from '../../../dto/sales.dto';
import { Sales } from 'src/interfaces/common/sales.interface';
import { Customer } from '../../../interfaces/common/customer.interface';
import { Admin } from 'src/interfaces/admin/admin.interface';
import { SalesReturn } from 'src/interfaces/common/sales-return.interface';
import { Product } from 'src/interfaces/common/product.interface';
import moment from 'moment';
import { Point } from '../../../interfaces/common/point.interface';
import { SalesLog } from '../../../interfaces/common/sales-log.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class SalesService {
  private logger = new Logger(SalesService.name);

  constructor(
    @InjectModel('Sales')
    private readonly salesModel: Model<Sales>,
    @InjectModel('Customer')
    private readonly customerModel: Model<Customer>,
    @InjectModel('UniqueId')
    private readonly uniqueIdModel: Model<UniqueId>,
    @InjectModel('Admin')
    private readonly adminModel: Model<Admin>,
    @InjectModel('ReturnSales')
    private readonly returnSalesModel: Model<SalesReturn>,
    @InjectModel('Product')
    private readonly productModel: Model<Product>,
    @InjectModel('Point')
    private readonly pointModel: Model<Point>,
    @InjectModel('SalesLog') private readonly salesLogModel: Model<SalesLog>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * ADD DATA
   * addSales()
   * insertManySales()
   */
  async addSales(
    shop: string,
    addSalesDto: AddSalesDto,
    salesman: Admin,
  ): Promise<ResponsePayload> {
    try {
      let newCustomer: Customer;
      let saveData: any;

      const { soldDate, soldDateString } = addSalesDto;
      const { customer } = addSalesDto;
      const { products } = addSalesDto;
      const { discountAmount } = addSalesDto;
      const { total } = addSalesDto;
      const { subTotal } = addSalesDto;

      // Update Quantity
      const saleProducts = products.filter((f) => f.saleType === 'Sale');
      const returnProducts = products.filter((f) => f.saleType === 'Return');
      for (const product of saleProducts) {
        await this.productModel.findByIdAndUpdate(product._id, {
          $inc: { quantity: -product.soldQuantity },
        });
      }

      for (const product of returnProducts) {
        await this.productModel.findByIdAndUpdate(product._id, {
          $inc: { quantity: +product.soldQuantity },
        });
      }

      const incInvoiceId: any = await this.uniqueIdModel.findOneAndUpdate(
        { shop: shop },
        { $inc: { invoiceNo: 1 } },
        { new: true, upsert: true },
      );
      const invoiceNo = this.padLeadingZeros(incInvoiceId.invoiceNo);

      if (customer && customer.phone) {
        // Point
        const pointData: Point = await this.pointModel.findOne({ shop: shop });
        const customerData: any = JSON.parse(
          JSON.stringify(
            await this.customerModel.findOne({
              phone: customer.phone.toString(),
            }),
          ),
        );

        //find salesman details
        const salesManInfo = await this.adminModel.findOne({
          _id: salesman._id,
        });

        //If customer exists
        if (customerData?._id) {
          const mData = {
            ...addSalesDto,
            soldDate,
            ...{
              month: this.utilsService.getDateMonth(
                false,
                this.utilsService.getDateString(new Date(soldDateString)),
              ),
              year: this.utilsService.getDateYear(
                this.utilsService.getDateString(new Date(soldDateString)),
              ),
              salesman: {
                _id: salesManInfo._id,
                name: salesManInfo.name,
              },
              customer: customerData,
            },
            products: products,
            total,
            subTotal,
            discountAmount,
            invoiceNo,
            shop: shop,
          };

          const data = new this.salesModel(mData);
          saveData = await data.save();
          // --------------------------------------------------------------------
          // if (customerData.userPoints && customerData.userPoints > 0) {
          //   await this.customerModel.findByIdAndUpdate(
          //     customerData?._id,
          //     {
          //       $inc: {
          //         userPoints: -addSalesDto.usePoints,
          //       },
          //     },
          //     { upsert: true, new: true },
          //   );
          // }

          // Pont Calc
          // await this.customerModel.findByIdAndUpdate(
          //   customerData?._id,
          //   {
          //     $inc: {
          //       userPoints: Math.floor((pointData?.pointAmount * total) / 100),
          //     },
          //   },
          //   { upsert: true, new: true },
          // );
        }
        //If customer don't exists
        else {
          const data = new this.customerModel({
            ...customer,
            ...{ userPoints: 0, shop: shop },
          });
          newCustomer = await data.save();

          if (newCustomer._id) {
            const mData = {
              ...addSalesDto,
              soldDate,
              ...{
                soldDateString: this.utilsService.getDateString(soldDate),
                month: this.utilsService.getDateMonth(
                  false,
                  this.utilsService.getDateString(soldDate),
                ),
                year: this.utilsService.getDateYear(
                  this.utilsService.getDateString(soldDate),
                ),
                salesman: {
                  _id: salesManInfo._id,
                  name: salesManInfo.name,
                },
                customer: newCustomer,
              },
              products: products,
              total,
              subTotal,
              discountAmount,
              invoiceNo,
              shop: shop,
            };

            const data = new this.salesModel(mData);
            saveData = await data.save();

            // Pont Calc
            await this.customerModel.findByIdAndUpdate(
              newCustomer?._id,
              {
                $inc: {
                  userPoints: Math.floor(
                    (pointData?.pointAmount * total) / 100,
                  ),
                },
              },
              { upsert: true, new: true },
            );
          }
        }

        return {
          success: true,
          message: 'Success! Data Added.',
          data: {
            _id: saveData._id,
            invoiceNo: saveData.invoiceNo,
          },
        } as ResponsePayload;
      } else {
        //find salesman details
        const salesManInfo = await this.adminModel.findOne({
          _id: salesman._id,
        });

        const mData = {
          ...addSalesDto,
          soldDate,
          ...{
            soldDateString: this.utilsService.getDateString(soldDate),
            salesman: {
              _id: salesManInfo._id,
              name: salesManInfo.name,
            },
          },
          products: products,
          total,
          subTotal,
          discountAmount,
          invoiceNo,
          shop: shop,
        };

        const data = new this.salesModel(mData);
        saveData = await data.save();

        return {
          success: true,
          message: 'Success! Data Added.',
          data: {
            _id: saveData._id,
            invoiceNo: saveData.invoiceNo,
          },
        } as ResponsePayload;
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * GET DATA
   * getAllSales()
   * getSalesById()
   * getCustomerSalesById()
   * getSalesmanSalesById()
   */

  async getAllSalesByShop(
    shop: string,
    filterSalesDto: FilterAndPaginationSalesDto,
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
      const { filter } = filterSalesDto;
      filterSalesDto.filter = { ...filter, ...{ shop: shop } };

      return this.getAllSales(filterSalesDto, searchQuery);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllSales(
    filterSalesDto: FilterAndPaginationSalesDto,
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
      const dataAggregates = await this.salesModel.aggregate(aggregateStages);
      const calculateAggregates = await this.salesModel.aggregate(
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

  async getAllReturnSalesByShop(
    shop: string,
    filterSalesDto: FilterAndPaginationSalesDto,
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
      const { filter } = filterSalesDto;
      filterSalesDto.filter = { ...filter, ...{ shop: shop } };
      return this.getAllReturnSales(filterSalesDto, searchQuery);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllReturnSales(
    filterSalesDto: FilterAndPaginationSalesDto,
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
      const dataAggregates = await this.salesModel.aggregate(aggregateStages);
      const calculateAggregates = await this.salesModel.aggregate(
        aggregateStagesCalculation,
      );

      console.log('aggregateStages', dataAggregates[0].products);

      const customerData: any = JSON.parse(
        JSON.stringify(await this.salesModel.aggregate(aggregateStages)),
      );

      // Format the data to ensure proper structure
      const formattedData = dataAggregates.map((item) => {
        return {
          _id: item._id.toString(), // Convert ObjectId to string to match your format
          saleType: item.saleType || 'Unknown', // Default if null or missing
          soldQuantity: item.soldQuantity || 0, // Default if null or missing
          name: item.name || 'No Name', // Default if null or missing
          sku: item.sku || 'No SKU', // Default if null or missing
          images: item.images || [], // Default if null or missing
          salePrice: item.salePrice || 0, // Default if null or missing
          purchasePrice: item.purchasePrice || 0, // Default if null or missing
          vendor: item.vendor
            ? {
                vendor_id: item.vendor._id.toString(),
                name: item.vendor.name || 'Unknown Vendor', // Default if missing
              }
            : undefined, // Only include vendor if it's not null
          imei: item.imei || 'No IMEI', // Default if null or missing
          colors: item.colors
            ? {
                color_id: item.colors._id.toString(),
                name: item.colors.name || 'Unknown Color', // Default if missing
              }
            : undefined, // Only include colors if it's not null
          sizes: item.sizes
            ? {
                size_id: item.sizes._id.toString(),
                name: item.sizes.name || 'Unknown Size', // Default if missing
              }
            : undefined, // Only include sizes if it's not null
          category: item.category
            ? {
                category_id: item.category._id.toString(),
                name: item.category.name || 'Unknown Category', // Default if missing
              }
            : undefined, // Only include category if it's not null
        };
      });
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
          data: formattedData,
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

  async getProductSales(
    filterSalesDto: FilterAndPaginationSalesDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterSalesDto;
    const { pagination } = filterSalesDto;
    const { sort } = filterSalesDto;
    const { select } = filterSalesDto;

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
      if (filter['products._id']) {
        filter['products._id'] = new ObjectId(filter['products._id']);
      }
      mFilter = { ...mFilter, ...filter };
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

    // Unwind
    aggregateStages.push({ $unwind: '$products' });

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
      const dataAggregates = await this.salesModel.aggregate(aggregateStages);
      // const calculateAggregates = await this.salesModel.aggregate(
      //   aggregateStagesCalculation,
      // );

      if (pagination) {
        return {
          ...{ ...dataAggregates[0] },
          ...{
            success: true,
            message: 'Success',
            // calculation: calculateAggregates[0],
          },
        } as ResponsePayload;
      } else {
        return {
          data: dataAggregates,
          success: true,
          message: 'Success',
          count: dataAggregates.length,
          // calculation: calculateAggregates[0],
        } as ResponsePayload;
      }
    } catch (err) {
      console.log(err);
      if (err.code && err.code.toString() === ErrorCodes.PROJECTION_MISMATCH) {
        throw new BadRequestException('Error! Projection mismatch');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getSalesById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.salesModel.findById(id);

      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getSalesByDate(
    date: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.salesModel.find({ date: date });

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

  async getCustomerSalesById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.salesModel
        .find({ 'customer._id': id })
        .select(select);

      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getSalesmanSalesById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.salesModel
        .find({ 'salesman._id': id })
        .select(select);

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
   * updateSalesById()
   * updateMultipleSalesById()
   */
  async updateSalesById(
    id: string,
    updateSalesDto: UpdateSalesDto,
  ): Promise<ResponsePayload> {
    try {
      await this.salesModel.findByIdAndUpdate(id, {
        $set: updateSalesDto,
      });

      return {
        success: true,
        message: 'Success',
        data: null,
      } as ResponsePayload;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async updateMultipleSalesById(
    ids: string[],
    updateSalesDto: UpdateSalesDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.salesModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateSalesDto },
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
   * deleteSalesById()
   * deleteMultipleSalesById()
   */
  async deleteSalesById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.salesModel.findById(id);
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
      await this.salesModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleSalesById(
    adminId: string,
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      // Fetch the products to log their details before deletion
      const productsToDelete = await this.salesModel
        .find({ _id: { $in: mIds } })
        .lean();

      // Perform the deletion
      await this.salesModel.deleteMany({ _id: { $in: mIds } });
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

        await this.salesLogModel.insertMany(logs); // Save logs
      }
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * ADDITIONAL FUNCTIONS
   */
  padLeadingZeros(num) {
    return String(num).padStart(4, '0');
  }

  getAllDaysInMonth(year, month) {
    const date = new Date(year, month, 1);

    const dates = [];

    while (date.getMonth() === month) {
      dates.push(moment(new Date(date)).format('YYYY-MM-DD'));
      date.setDate(date.getDate() + 1);
    }

    return dates;
  }
}
