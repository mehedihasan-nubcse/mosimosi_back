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
  AddPreOrderDto,
  FilterAndPaginationPreOrderDto,
  UpdatePreOrderDto,
} from '../../../dto/pre-order.dto';
import { Customer } from '../../../interfaces/common/customer.interface';
import { Admin } from 'src/interfaces/admin/admin.interface';
import moment from 'moment';
import { Point } from '../../../interfaces/common/point.interface';
import { PreOrder } from '../../../interfaces/common/pre-order.interface';
import { PreSaleProduct } from '../../../interfaces/common/presale-product.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class PreOrderService {
  private logger = new Logger(PreOrderService.name);

  constructor(
    @InjectModel('PreOrder')
    private readonly preOrderModel: Model<PreOrder>,
    @InjectModel('Customer')
    private readonly customerModel: Model<Customer>,
    @InjectModel('UniqueId')
    private readonly uniqueIdModel: Model<UniqueId>,
    @InjectModel('Admin')
    private readonly adminModel: Model<Admin>,
    @InjectModel('PreSaleProduct')
    private readonly productModel: Model<PreSaleProduct>,
    @InjectModel('Point')
    private readonly pointModel: Model<Point>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * ADD DATA
   * addPreOrder()
   * insertManyPreOrder()
   */
  async addPreOrder(
    shop: string,
    addPreOrderDto: AddPreOrderDto,
    salesman: Admin,
  ): Promise<ResponsePayload> {
    try {
      let newCustomer: Customer;
      let saveData: any;

      const { soldDate } = addPreOrderDto;
      const { customer } = addPreOrderDto;
      const { products } = addPreOrderDto;
      const { discountAmount } = addPreOrderDto;
      const { total } = addPreOrderDto;
      const { subTotal } = addPreOrderDto;

      // Update Quantity
      // for (const product of products) {
      //   await this.productModel.findByIdAndUpdate(product._id, {
      //     $inc: { quantity: -product.soldQuantity },
      //   });
      // }

      const incInvoiceId: any = await this.uniqueIdModel.findOneAndUpdate(
        { shop: shop },
        { $inc: { invoiceNo: 1 } },
        { new: true, upsert: true },
      );
      const invoiceNo = this.padLeadingZeros(incInvoiceId.invoiceNo);

      if (customer && customer.phone) {
        // Point
        const pointData: Point = await this.pointModel.findOne({});
        const customerData: any = await this.customerModel.findOne({
          phone: customer.phone.toString(),
        });

        //find salesman details
        const preOrderManInfo = await this.adminModel.findOne({
          _id: salesman._id,
        });

        //If customer exists
        if (customerData?._id) {
          const mData = {
            ...addPreOrderDto,
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
                _id: preOrderManInfo._id,
                name: preOrderManInfo.name,
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

          const data = new this.preOrderModel(mData);
          saveData = await data.save();
          // --------------------------------------------------------------------
          if (customerData.userPoints && customerData.userPoints > 0) {
            await this.customerModel.findByIdAndUpdate(
              customerData?._id,
              {
                $inc: {
                  userPoints: -addPreOrderDto.usePoints,
                },
              },
              { upsert: true, new: true },
            );
          }

          // Pont Calc
          await this.customerModel.findByIdAndUpdate(
            customerData?._id,
            {
              $inc: {
                userPoints: Math.floor((pointData.pointAmount * total) / 100),
              },
            },
            { upsert: true, new: true },
          );
        }
        //If customer don't exists
        else {
          const data = new this.customerModel({
            ...customer,
            ...{ userPoints: 0 },
          });
          newCustomer = await data.save();

          if (newCustomer._id) {
            const mData = {
              ...addPreOrderDto,
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
                  _id: preOrderManInfo._id,
                  name: preOrderManInfo.name,
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

            const data = new this.preOrderModel(mData);
            saveData = await data.save();

            // Pont Calc
            await this.customerModel.findByIdAndUpdate(
              newCustomer?._id,
              {
                $inc: {
                  userPoints: Math.floor((pointData.pointAmount * total) / 100),
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
        const preOrderManInfo = await this.adminModel.findOne({
          _id: salesman._id,
        });

        const mData = {
          ...addPreOrderDto,
          soldDate,
          ...{
            soldDateString: this.utilsService.getDateString(soldDate),
            salesman: {
              _id: preOrderManInfo._id,
              name: preOrderManInfo.name,
            },
          },
          products: products,
          total,
          subTotal,
          discountAmount,
          invoiceNo,
          shop: shop,
        };

        const data = new this.preOrderModel(mData);
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
   * getAllPreOrder()
   * getPreOrderById()
   * getCustomerPreOrderById()
   * getPreOrdermanPreOrderById()
   */

  async getAllPreOrderByShop(
    shop: string,
    filterPreOrderDto: FilterAndPaginationPreOrderDto,
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
      const { filter } = filterPreOrderDto;
      filterPreOrderDto.filter = { ...filter, ...{ shop: shop } };

      return this.getAllPreOrder(filterPreOrderDto, searchQuery);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllPreOrder(
    filterPreOrderDto: FilterAndPaginationPreOrderDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterPreOrderDto;
    const { pagination } = filterPreOrderDto;
    const { sort } = filterPreOrderDto;
    const { select } = filterPreOrderDto;

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

    // Match
    if (filter) {
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
      // Calculations
      const group = {
        $group: {
          _id: null,
          grandTotal: { $sum: '$total' },
        },
      };
      aggregateStagesCalculation.push(group);
    }
    if (searchQuery) {
      mFilter = {
        $and: [
          mFilter,
          {
            $or: [
              { invoiceNo: { $regex: searchQuery, $options: 'i' } },
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
      const dataAggregates = await this.preOrderModel.aggregate(
        aggregateStages,
      );
      const calculateAggregates = await this.preOrderModel.aggregate(
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

  async getAllPreOrderByMonth(
    filterPreOrderDto: FilterAndPaginationPreOrderDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterPreOrderDto;
    const { pagination } = filterPreOrderDto;
    const { sort } = filterPreOrderDto;
    const { select } = filterPreOrderDto;

    // Essential Variables
    const aggregateStages = [];
    let mFilter = {};
    let mSort = {};
    let mSelect = {};
    let mPagination = {};

    const now = new Date();
    const dates = this.getAllDaysInMonth(now.getFullYear(), now.getMonth());

    // Calculations
    const aggregateStagesCalculation = [];

    // Match
    if (filter) {
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
      // Calculations
      const group = {
        $group: {
          _id: null,
          grandTotal: { $sum: '$total' },
        },
      };
      aggregateStagesCalculation.push(group);
    }
    if (searchQuery) {
      mFilter = {
        $and: [
          mFilter,
          {
            $or: [
              { invoiceNo: { $regex: searchQuery, $options: 'i' } },
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
      const dataAggregates = await this.preOrderModel.aggregate(
        aggregateStages,
      );
      const calculateAggregates = await this.preOrderModel.aggregate(
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

  async getPreOrderById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.preOrderModel.findById(id);

      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getPreOrderByDate(
    date: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.preOrderModel.find({ date: date });

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

  async getCustomerPreOrderById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.preOrderModel
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

  async getPreOrdermanPreOrderById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.preOrderModel
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
   * updatePreOrderById()
   * updateMultiplePreOrderById()
   */
  async updatePreOrderById(
    id: string,
    updatePreOrderDto: UpdatePreOrderDto,
  ): Promise<ResponsePayload> {
    try {
      await this.preOrderModel.findByIdAndUpdate(id, {
        $set: updatePreOrderDto,
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

  async updateMultiplePreOrderById(
    ids: string[],
    updatePreOrderDto: UpdatePreOrderDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.preOrderModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updatePreOrderDto },
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
   * deletePreOrderById()
   * deleteMultiplePreOrderById()
   */
  async deletePreOrderById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.preOrderModel.findById(id);
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
      await this.preOrderModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultiplePreOrderById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.preOrderModel.deleteMany({ _id: mIds });
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
