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
import { UtilsService } from '../../shared/utils/utils.service';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { ErrorCodes } from '../../enum/error-code.enum';
import {
  AddRegistrationDto,
  FilterAndPaginationRegistrationDto,
  UpdateRegistrationDto,
} from '../../dto/registration.dto';
import { Registration } from 'src/interfaces/common/registration.interface';
import { PromoOffer } from '../../interfaces/common/promo-offer.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class RegistrationService {
  private logger = new Logger(RegistrationService.name);

  constructor(
    @InjectModel('Registration')
    private readonly registrationModel: Model<Registration>,
    @InjectModel('PromoOffer')
    private readonly promoOfferModel: Model<PromoOffer>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * addRegistration
   * insertManyRegistration
   */
  async addRegistration(
    addRegistrationDto: AddRegistrationDto,
  ): Promise<ResponsePayload> {
    try {
      const { phoneNo, offerId } = addRegistrationDto;

      const today: Date = this.utilsService.getLocalDateTime();
      const todayString: string = this.utilsService.getDateString(today);

      // Check Today Total Registration
      const todayTotalReg = await this.registrationModel.countDocuments({
        offerId: offerId,
        dateString: todayString,
      });

      if (todayTotalReg >= 20000) {
        return {
          success: false,
          message: "Sorry! Today's Registration is over!",
          data: null,
        } as ResponsePayload;
      } else {
        // Check Total PhoneNo Registration
        const totalWithPhoneNo = await this.registrationModel.countDocuments({
          offerId: offerId,
          phoneNo: phoneNo,
        });

        if (totalWithPhoneNo >= 2) {
          return {
            success: false,
            message: 'Sorry! Your submission is over in this offer.',
            data: null,
          } as ResponsePayload;
        } else {
          // Check Today Total PhoneNo Registration
          const todayWithPhoneNo = await this.registrationModel.countDocuments({
            offerId: offerId,
            phoneNo: phoneNo,
            dateString: todayString,
          });

          if (todayWithPhoneNo >= 1) {
            return {
              success: false,
              message: 'Sorry! You already submit your phone number today',
              data: null,
            } as ResponsePayload;
          } else {
            // Submit Data
            const defaultData = {
              month: this.utilsService.getDateMonth(false, today),
              date: today,
              dateString: todayString,
            };
            const mData = { ...addRegistrationDto, ...defaultData };
            const newData = new this.registrationModel(mData);

            await newData.save();

            await this.promoOfferModel.findByIdAndUpdate(offerId, {
              $inc: { totalSubmit: 1 },
            });

            return {
              success: true,
              message: 'Success! Thank you for submit your phone number',
            } as ResponsePayload;
          }
        }
      }
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
   * getAllRegistrations
   * getRegistrationById
   */
  async getAllRegistrations(
    filterRegistrationDto: FilterAndPaginationRegistrationDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterRegistrationDto;
    const { pagination } = filterRegistrationDto;
    const { sort } = filterRegistrationDto;
    const { select } = filterRegistrationDto;

    // Essential Variables
    const aggregateStages = [];
    let mFilter = {};
    let mSort = {};
    let mSelect = {};
    let mPagination = {};

    // Match
    if (filter) {
      mFilter = { ...mFilter, ...filter };
    }
    if (searchQuery) {
      mFilter = { ...mFilter, ...{ phoneNo: new RegExp(searchQuery, 'i') } };
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
      const dataAggregates = await this.registrationModel.aggregate(
        aggregateStages,
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
        throw new InternalServerErrorException();
      }
    }
  }

  async getRegistrationById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.registrationModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getUserRegistrationById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.registrationModel.findById(id);
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
   * updateRegistrationById
   * updateMultipleRegistrationById
   */
  async updateRegistrationById(
    id: string,
    updateRegistrationDto: UpdateRegistrationDto,
  ): Promise<ResponsePayload> {
    try {
      const finalData = { ...updateRegistrationDto };

      await this.registrationModel.findByIdAndUpdate(id, {
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

  async updateMultipleRegistrationById(
    ids: string[],
    updateRegistrationDto: UpdateRegistrationDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.registrationModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateRegistrationDto },
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
   * deleteRegistrationById
   * deleteMultipleRegistrationById
   */
  async deleteRegistrationById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.registrationModel.findById(id);
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
      await this.registrationModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleRegistrationById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.registrationModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
