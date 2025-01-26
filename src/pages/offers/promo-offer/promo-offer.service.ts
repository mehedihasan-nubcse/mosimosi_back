import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from '../../../shared/utils/utils.service';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { ErrorCodes } from '../../../enum/error-code.enum';
import { PromoOffer } from '../../../interfaces/common/promo-offer.interface';
import {
  AddPromoOfferDto,
  FilterAndPaginationPromoOfferDto,
  OptionPromoOfferDto,
  UpdatePromoOfferDto,
} from '../../../dto/promo-offer.dto';
import { JobSchedulerService } from '../../../shared/job-scheduler/job-scheduler.service';

const ObjectId = Types.ObjectId;

@Injectable()
export class PromoOfferService {
  private logger = new Logger(PromoOfferService.name);

  constructor(
    @InjectModel('PromoOffer')
    private readonly promoOfferModel: Model<PromoOffer>,
    private configService: ConfigService,
    private utilsService: UtilsService,
    private jobSchedulerService: JobSchedulerService,
  ) {}

  /**
   * addPromoOffer
   * insertManyPromoOffer
   */
  async addPromoOffer(
    addPromoOfferDto: AddPromoOfferDto,
  ): Promise<ResponsePayload> {
    try {
      const { title } = addPromoOfferDto;

      // Check Single Document
      const checkData = await this.promoOfferModel.findOne();
      if (checkData) {
        return {
          success: false,
          message: 'Data Cannot be Added. Its a Single Document Collection',
          data: null,
        } as ResponsePayload;
      }

      const defaultData = {
        slug: this.utilsService.transformToSlug(title, true),
      };
      const mData = { ...addPromoOfferDto, ...defaultData };
      const newData = new this.promoOfferModel(mData);

      const saveData = await newData.save();

      return {
        success: true,
        message: 'Data Added Success',
        data: saveData._id,
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

  async insertManyPromoOffer(
    addPromoOffersDto: AddPromoOfferDto[],
    optionPromoOfferDto: OptionPromoOfferDto,
  ): Promise<ResponsePayload> {
    const { deleteMany } = optionPromoOfferDto;
    if (deleteMany) {
      await this.promoOfferModel.deleteMany({});
    }
    const mData = addPromoOffersDto.map((m) => {
      return {
        ...m,
        ...{
          slug: this.utilsService.transformToSlug(m.title),
        },
      };
    });
    try {
      const saveData = await this.promoOfferModel.insertMany(mData);
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
   * getAllPromoOffers
   * getPromoOfferById
   */
  async getAllPromoOffers(
    filterPromoOfferDto: FilterAndPaginationPromoOfferDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterPromoOfferDto;
    const { pagination } = filterPromoOfferDto;
    const { sort } = filterPromoOfferDto;
    const { select } = filterPromoOfferDto;

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
      const dataAggregates = await this.promoOfferModel.aggregate(
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

  async getPromoOfferById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.promoOfferModel.findById(id);

      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getPromoOfferSingle(select?: string): Promise<ResponsePayload> {
    try {
      const data = await this.promoOfferModel
        .findOne({})
        .populate('products.product')
        .select(select ? select : '');

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
   * updatePromoOfferById
   * updateMultiplePromoOfferById
   */
  async updatePromoOfferById(
    id: string,
    updatePromoOfferDto: UpdatePromoOfferDto,
  ): Promise<ResponsePayload> {
    try {
      const { title } = updatePromoOfferDto;

      const data = await this.promoOfferModel.findById(id);

      const finalData = { ...updatePromoOfferDto };
      // Check Slug
      if (title) {
        if (title && data.title !== title) {
          finalData.slug = this.utilsService.transformToSlug(title, true);
        }
      }

      await this.promoOfferModel.findByIdAndUpdate(id, {
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

  async updateMultiplePromoOfferById(
    ids: string[],
    updatePromoOfferDto: UpdatePromoOfferDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    // Delete No Multiple Action Data
    if (updatePromoOfferDto.slug) {
      delete updatePromoOfferDto.slug;
    }

    try {
      await this.promoOfferModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updatePromoOfferDto },
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
   * deletePromoOfferById
   * deleteMultiplePromoOfferById
   */
  async deletePromoOfferById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      await this.promoOfferModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultiplePromoOfferById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));

      await this.promoOfferModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
