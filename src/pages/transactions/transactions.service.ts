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
import { UtilsService } from '../../shared/utils/utils.service';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { ErrorCodes } from '../../enum/error-code.enum';
import { Transactions } from 'src/interfaces/common/transactions.interface';
import {
  AddTransactionsDto,
  FilterAndPaginationTransactionsDto,
  UpdateTransactionsDto,
} from 'src/dto/transactions.dto';
import { Admin } from 'src/interfaces/admin/admin.interface';
import { Vendor } from 'src/interfaces/common/vendor.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class TransactionsService {
  private logger = new Logger(TransactionsService.name);

  constructor(
    @InjectModel('Transactions')
    private readonly transactionModel: Model<Transactions>,

    @InjectModel('Vendor')
    private readonly vendorModel: Model<Vendor>,

    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * ADD DATA
   * addTransactions()
   * insertManyTransactions()
   */
  async addTransactions(
    shop: string,
    addTransactionsDto: AddTransactionsDto,
    admin: Admin,
  ): Promise<ResponsePayload> {
    try {
      const { vendorId } = addTransactionsDto;
      const { date } = addTransactionsDto;
      const vendor: Vendor = await this.vendorModel.findById(vendorId);

      if (vendor?._id) {
        const dateString = this.utilsService.getDateString(date);

        const mData = {
          ...addTransactionsDto,
          dateString,
          vendor,
          shop: shop,
        };

        const data = new this.transactionModel(mData);
        const saveData = await data.save();

        // Update Vendor Base Data
        await this.vendorModel.findByIdAndUpdate(
          vendorId,
          {
            $inc: {
              totalPaid: addTransactionsDto.paidAmount,
              totalPayable: addTransactionsDto.payableAmount ?? 0,
            },
          },
          { upsert: true, new: true },
        );

        return {
          success: true,
          message: 'Success! Data Added.',
          data: {
            _id: saveData._id,
          },
        } as ResponsePayload;
      } else {
        return {
          success: false,
          message: 'Error! No Vendor Data Added.',
          data: null,
        } as ResponsePayload;
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * GET DATA
   * getAllTransactionss()
   * getTransactionsById()
   * getUserTransactionsById()
   */



  async getAllTransactionsByShop(
    shop: string,
    filterTransactionsDto: FilterAndPaginationTransactionsDto,
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
      const { filter } = filterTransactionsDto;
      filterTransactionsDto.filter = { ...filter, ...{ shop: shop } };

      return this.getAllTransactionss(filterTransactionsDto, searchQuery);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }



  async getAllTransactionss(
    filterTransactionsDto: FilterAndPaginationTransactionsDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterTransactionsDto;
    const { pagination } = filterTransactionsDto;
    const { sort } = filterTransactionsDto;
    const { select } = filterTransactionsDto;

    // Essential Variables
    const aggregateStages = [];

    // Calculations
    const aggregateStagesCalculation = [];

    let mFilter = {};
    let mSort = {};
    let mSelect = {};
    let mPagination = {};



    // Match
    if (filter) {
      if (filter['shop']) {
        filter['shop'] = new ObjectId(filter['shop']);
      }
    }



    // Match
    if (filter) {
      if (filter['vendor._id']) {
        filter['vendor._id'] = new ObjectId(filter['vendor._id']);
      }
      mFilter = { ...mFilter, ...filter };

      // Calculations
      const group = {
        $group: {
          _id: null,
          totalPaid: { $sum: '$paidAmount' },
          totalPayable: { $sum: '$payableAmount' },
        },
      };

      aggregateStagesCalculation.push({ $match: mFilter });
      aggregateStagesCalculation.push(group);
    } else {
      // Calculations
      const group = {
        $group: {
          _id: null,
          totalPaid: { $sum: '$paidAmount' },
          totalPayable: { $sum: '$payableAmount' },
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
              { 'vendor.name': { $regex: searchQuery, $options: 'i' } },
              { 'vendor.phone': { $regex: searchQuery, $options: 'i' } },
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
      console.log(select);
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
      const dataAggregates = await this.transactionModel.aggregate(
        aggregateStages,
      );

      const calculateAggregates = await this.transactionModel.aggregate(
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

  async getTransactionsById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.transactionModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getTransactionsByDate(
    date: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.transactionModel.find({ date: date });
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

  async getUserTransactionsById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.transactionModel.findById(id);
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
   * updateTransactionsById()
   * updateMultipleTransactionsById()
   */
  async updateTransactionsById(
    id: string,
    updateTransactionsDto: UpdateTransactionsDto,
  ): Promise<ResponsePayload> {
    try {
      const finalData = { ...updateTransactionsDto };

      const fData = await this.transactionModel.findById(id);
      const jData = JSON.parse(JSON.stringify(fData));

      await this.vendorModel.findByIdAndUpdate(jData.vendor._id, {
        $inc: {
          totalPaid: -jData.paidAmount,
          totalPayable: -jData.payableAmount,
        },
      });

      await this.transactionModel.findByIdAndUpdate(id, {
        $set: finalData,
      });

      await this.vendorModel.findByIdAndUpdate(jData.vendor._id, {
        $inc: {
          totalPaid: updateTransactionsDto.paidAmount,
          totalPayable: updateTransactionsDto.payableAmount,
        },
      });

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async updateMultipleTransactionsById(
    ids: string[],
    updateTransactionsDto: UpdateTransactionsDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.transactionModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateTransactionsDto },
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
   * deleteTransactionsById()
   * deleteMultipleTransactionsById()
   */
  async deleteTransactionsById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.transactionModel.findById(id);
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
      await this.transactionModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleTransactionsById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      const fData = await this.transactionModel.find({ _id: { $in: mIds } });
      const jData = JSON.parse(JSON.stringify(fData));
      for (const data of jData) {
        await this.vendorModel.findByIdAndUpdate(data.vendor._id, {
          $inc: {
            totalPaid: -data.paidAmount,
            totalPayable: -data.payableAmount,
          },
        });
      }
      await this.transactionModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
