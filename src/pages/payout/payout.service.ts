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
import {
  AddPayoutDto,
  CheckPayoutDto,
  FilterAndPaginationPayoutDto,
  OptionPayoutDto,
  UpdatePayoutDto,
} from '../../dto/payout.dto';
import { User } from '../../interfaces/user/user.interface';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { Payout } from '../../interfaces/common/payout.interface';
import { ErrorCodes } from '../../enum/error-code.enum';
import { UtilsService } from '../../shared/utils/utils.service';

const ObjectId = Types.ObjectId;

@Injectable()
export class PayoutService {
  private logger = new Logger(PayoutService.name);

  constructor(
    @InjectModel('Payout') private readonly payoutModel: Model<Payout>,
    @InjectModel('User') private readonly userModel: Model<User>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * addPayout
   * insertManyPayout
   */
  async addPayout(
    shop: string,
    addPayoutDto: AddPayoutDto,
  ): Promise<ResponsePayload> {
    const { name } = addPayoutDto;
    try {
      const newData = new this.payoutModel({
        ...addPayoutDto,
        ...{
          shop: shop,
        },
      });
      const saveData = await newData.save();
      const data = {
        _id: saveData._id,
      };
      return {
        success: true,
        message: 'Data Added Successfully',
        data,
      } as ResponsePayload;
    } catch (error) {
      console.log(error);
      if (error.code && error.code.toString() === ErrorCodes.UNIQUE_FIELD) {
        throw new ConflictException('Slug Must be Unique');
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async insertManyPayout(
    addPayoutsDto: AddPayoutDto[],
    optionPayoutDto: OptionPayoutDto,
  ): Promise<ResponsePayload> {
    const { deleteMany } = optionPayoutDto;
    if (deleteMany) {
      await this.payoutModel.deleteMany({});
    }
    const mData = addPayoutsDto.map((m) => {
      return {
        ...m,
        ...{
          slug: this.utilsService.transformToSlug(m.name),
        },
      };
    });
    try {
      const saveData = await this.payoutModel.insertMany(mData);
      return {
        success: true,
        message: `${
          saveData && saveData.length ? saveData.length : 0
        }  Data Added Success`,
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
   * getAllPayouts
   * getPayoutById
   */
  async getAllPayoutsBasic() {
    try {
      const pageSize = 10;
      const currentPage = 1;

      const data = await this.payoutModel
        .find()
        .skip(pageSize * (currentPage - 1))
        .limit(Number(pageSize));
      return {
        success: true,
        message: 'Success',

        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getAllPayoutByShop(
    shop: string,
    filterPayoutDto: FilterAndPaginationPayoutDto,
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
      const { filter } = filterPayoutDto;
      filterPayoutDto.filter = { ...filter, ...{ shop: shop } };

      return this.getAllPayouts(filterPayoutDto, searchQuery);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllPayouts(
    filterPayoutDto: FilterAndPaginationPayoutDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterPayoutDto;
    const { pagination } = filterPayoutDto;
    const { sort } = filterPayoutDto;
    const { select } = filterPayoutDto;

    // Essential Variables
    const aggregateSpayoutes = [];
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
      mFilter = { ...mFilter, ...filter };
    }
    if (searchQuery) {
      mFilter = { ...mFilter, ...{ name: new RegExp(searchQuery, 'i') } };
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
      mSelect = {
        name: 1,
      };
    }

    // Finalize
    if (Object.keys(mFilter).length) {
      aggregateSpayoutes.push({ $match: mFilter });
    }

    if (Object.keys(mSort).length) {
      aggregateSpayoutes.push({ $sort: mSort });
    }

    if (!pagination) {
      aggregateSpayoutes.push({ $project: mSelect });
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

      aggregateSpayoutes.push(mPagination);

      aggregateSpayoutes.push({
        $project: {
          data: 1,
          count: { $arrayElemAt: ['$metadata.total', 0] },
        },
      });
    }

    try {
      const dataAggregates = await this.payoutModel.aggregate(
        aggregateSpayoutes,
      );
      if (pagination) {
        return {
          ...{ ...dataAggregates[0] },
          ...{ success: true, message: 'Success' },
        } as ResponsePayload;
      } else {
        return {
          data: dataAggregates,
          success: true,
          message: 'Success',
          count: dataAggregates.length,
        } as ResponsePayload;
      }
    } catch (err) {
      this.logger.error(err);
      if (err.code && err.code.toString() === ErrorCodes.PROJECTION_MISMATCH) {
        throw new BadRequestException('Error! Projection mismatch');
      } else {
        throw new InternalServerErrorException(err.message);
      }
    }
  }

  async getPayoutById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.payoutModel.findById(id);
      return {
        success: true,
        message: 'Single contact get Successfully',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * updatePayoutById
   * updateMultiplePayoutById
   */
  async updatePayoutById(
    id: string,
    updatePayoutDto: UpdatePayoutDto,
  ): Promise<ResponsePayload> {
    const { name } = updatePayoutDto;
    let data;
    try {
      data = await this.payoutModel.findById(id);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
    if (!data) {
      throw new NotFoundException('No Data found!');
    }
    try {
      const finalData = { ...updatePayoutDto };

      await this.payoutModel.findByIdAndUpdate(id, {
        $set: finalData,
      });
      return {
        success: true,
        message: 'Update Successfully',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async getPayout(select: string): Promise<ResponsePayload> {
    try {
      const data = await this.payoutModel.findOne({}).select(select);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async updateMultiplePayoutById(
    ids: string[],
    updatePayoutDto: UpdatePayoutDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.payoutModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updatePayoutDto },
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
   * deletePayoutById
   * deleteMultiplePayoutById
   */
  async deletePayoutById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.payoutModel.findById(id);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
    if (!data) {
      throw new NotFoundException('No Data found!');
    }
    try {
      await this.payoutModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Delete Successfully',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultiplePayoutById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.payoutModel.deleteMany({ _id: ids });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * COUPON FUNCTIONS
   * generateOtpWithPhoneNo()
   * validateOtpWithPhoneNo()
   */
  async checkPayoutAvailability(
    user: User,
    checkPayoutDto: CheckPayoutDto,
  ): Promise<ResponsePayload> {
    try {
      const { payoutCode, subTotal } = checkPayoutDto;

      const payoutData = await this.payoutModel.findOne({ payoutCode });

      if (payoutData) {
        const isExpired = this.utilsService.getDateDifference(
          new Date(),
          // new Date(payoutData.endDateTime),
          'seconds',
        );

        const isStartDate = this.utilsService.getDateDifference(
          new Date(),
          // new Date(payoutData.startDateTime),
          'seconds',
        );

        if (isStartDate > 0) {
          return {
            success: false,
            message: 'Sorry! Payout offer is not start yet',
            data: null,
          } as ResponsePayload;
        }

        if (isExpired <= 0) {
          return {
            success: false,
            message: 'Sorry! Payout Expired',
            data: null,
          } as ResponsePayload;
        } else {
          const userPayoutExists = await this.userModel.findOne({
            _id: user._id,
            usedPayouts: payoutData._id,
          });

          if (userPayoutExists) {
            return {
              success: false,
              message: 'Sorry! Payout already used in your account.',
              data: null,
            } as ResponsePayload;
          } else {
            if (payoutData['minimumAmount'] > subTotal) {
              return {
                success: false,
                message: `Sorry! Payout minimum amount is ${payoutData['minimumAmount']}`,
                data: null,
              } as ResponsePayload;
            } else {
              return {
                success: true,
                message: 'Success! Payout added.',
                data: {
                  _id: payoutData._id,
                  discountAmount: payoutData['discountAmount'],
                  discountType: payoutData['discountType'],
                  payoutCode: payoutData['payoutCode'],
                },
              } as ResponsePayload;
            }
          }
        }
      } else {
        return {
          success: false,
          message: 'Sorry! Invalid contact code',
          data: null,
        } as ResponsePayload;
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
