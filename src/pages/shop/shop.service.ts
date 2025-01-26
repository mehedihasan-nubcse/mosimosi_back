import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ErrorCodes } from 'src/enum/error-code.enum';

import { Shop } from './interfaces/shop.interface';
import {
  AddShopDto,
  CheckShopAvailabilityDto,
  FilterAndPaginationShopDto,
  UpdateShopDto,
} from './dto/shop.dto';

import { UtilsService } from '../../shared/utils/utils.service';
import * as fs from 'fs';
import * as path from 'path';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { OptionPayloadDto } from '../../dto/api-response.dto';

const ObjectId = Types.ObjectId;

@Injectable()
export class ShopService {
  private logger = new Logger(ShopService.name);

  constructor(
    @InjectModel('Shop')
    private readonly shopModel: Model<Shop>,
    private readonly utilsService: UtilsService,
  ) {}

  /**
   * checkShopAvailability()
   * buildShop()
   * insertManyShop()
   * getAllShop()
   * getAllShopBasic()
   * getShopById()
   * updateShopById()
   * updateMultipleShopById()
   * deleteShopById()
   * deleteMultipleShopById()
   * getShopCategory()
   * getShopSubCategory()
   */

  async checkShopAvailability(
    checkShopAvailabilityDto: CheckShopAvailabilityDto,
  ): Promise<ResponsePayload> {
    try {
      const { slug } = checkShopAvailabilityDto;

      const fShop = await this.shopModel.exists({ slug });
      return {
        success: true,
        message: fShop
          ? 'Shop domain is not available'
          : 'Shop domain is available',
        data: !fShop,
      } as ResponsePayload;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async createShop(addShopDto: AddShopDto): Promise<ResponsePayload> {
    try {
      const defaultData = {
        dateString: this.utilsService.getDateString(new Date()),
      };

      const finalData = { ...addShopDto, ...defaultData };

      const saveData = await this.shopModel.create(finalData);

      const data = {
        _id: saveData._id,
        vendor: addShopDto['owner'],
      };
      return {
        success: true,
        message: 'Success! Branch created successfully.',
        data,
      } as ResponsePayload;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async insertManyShop(
    addShopDto: AddShopDto[],
    optionShopDto: OptionPayloadDto,
  ): Promise<ResponsePayload> {
    try {
      const { deleteMany } = optionShopDto;
      if (deleteMany) {
        await this.shopModel.deleteMany({});
      }
      const saveData = await this.shopModel.insertMany(addShopDto);
      return {
        success: true,
        message: `${
          saveData && saveData.length ? saveData.length : 0
        }  Data Added Success`,
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

  async getAllShop(
    filterShopDto: FilterAndPaginationShopDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterShopDto;
    const { pagination } = filterShopDto;
    const { sort } = filterShopDto;
    const { select } = filterShopDto;

    if (filter && filter['users._id']) {
      filter['users._id'] = new ObjectId(filter['users._id']);
    }

    // Essential Variables
    const aggregateSbanneres = [];
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
      mSelect = {
        name: 1,
      };
    }

    // Finalize
    if (Object.keys(mFilter).length) {
      aggregateSbanneres.push({ $match: mFilter });
    }

    if (Object.keys(mSort).length) {
      aggregateSbanneres.push({ $sort: mSort });
    }

    if (!pagination) {
      aggregateSbanneres.push({ $project: mSelect });
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

      aggregateSbanneres.push(mPagination);

      aggregateSbanneres.push({
        $project: {
          data: 1,
          count: { $arrayElemAt: ['$metadata.total', 0] },
        },
      });
    }

    try {
      const dataAggregates = await this.shopModel.aggregate(aggregateSbanneres);
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
        throw new BadRequestException('Error! Bannerion mismatch');
      } else {
        throw new InternalServerErrorException(err.message);
      }
    }
  }

  async getAllShopBasic() {
    try {
      const pageSize = 10;
      const currentPage = 1;

      const data = await this.shopModel
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

  async getShopById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.shopModel.findById(id);
      return {
        success: true,
        message: 'Single profile get Successfully',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getShopPageByPage(
    pageName: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.shopModel
        .findOne({ pageName: pageName })
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

  async updateShopById(
    id: string,
    updateShopDto: UpdateShopDto,
  ): Promise<ResponsePayload> {
    try {
      const finalData = { ...updateShopDto };

      await this.shopModel.findByIdAndUpdate(id, {
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

  async updateMultipleShopById(
    ids: string[],
    updateShopDto: UpdateShopDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.shopModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateShopDto },
      );

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteShopById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      await this.shopModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Delete Successfully',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleShopById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.shopModel.deleteMany({ _id: ids });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getShopCategory(): Promise<ResponsePayload> {
    try {
      const filePath = path.join('./upload', 'json', 'shop-category.json');

      const jsonData = fs.readFileSync(filePath, 'utf8');

      return {
        success: true,
        message: 'Success',
        data: JSON.parse(jsonData),
      } as ResponsePayload;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  async getShopSubCategory(): Promise<ResponsePayload> {
    try {
      const filePath = path.join('./upload', 'json', 'shop-sub-category.json');

      const jsonData = fs.readFileSync(filePath, 'utf8');

      return {
        success: true,
        message: 'Success',
        data: JSON.parse(jsonData),
      } as ResponsePayload;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err.message);
    }
  }
}
