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
  AddSubCategoryDto,
  FilterAndPaginationSubCategoryDto,
  UpdateSubCategoryDto,
} from '../../../dto/sub-category.dto';
import { SubCategory } from 'src/interfaces/common/sub-category.interface';
import { Category } from '../../../interfaces/common/category.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class SubCategoryService {
  private logger = new Logger(SubCategoryService.name);

  constructor(
    @InjectModel('SubCategory')
    private readonly SubCategoryModel: Model<SubCategory>,
    @InjectModel('Category')
    private readonly categoryModel: Model<Category>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * ADD DATA
   * addSubCategory()
   * insertManySubCategory()
   */
  async addSubCategory(
    shop: string,
    addSubCategoryDto: AddSubCategoryDto,
  ): Promise<ResponsePayload> {
    try {
      const { category } = addSubCategoryDto;

      const createdAtString = this.utilsService.getDateString(new Date());
      const categoryData = await this.categoryModel.findById(category);

      const mData = {
        ...addSubCategoryDto,
        ...{
          createdAtString,
          categoryInfo: categoryData,
          shop: shop,
        },
      };
      const data = new this.SubCategoryModel(mData);
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
   * getAllSubCategory()
   * getSubCategoryById()
   * getUserSubCategoryById()
   */

  async getAllSubCategoryByShop(
    shop: string,
    filterSubCategoryDto: FilterAndPaginationSubCategoryDto,
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
      const { filter } = filterSubCategoryDto;
      filterSubCategoryDto.filter = { ...filter, ...{ shop: shop } };

      return this.getAllSubCategory(filterSubCategoryDto, searchQuery);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllSubCategory(
    filterSubCategoryDto: FilterAndPaginationSubCategoryDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterSubCategoryDto;
    const { pagination } = filterSubCategoryDto;
    const { sort } = filterSubCategoryDto;
    const { select } = filterSubCategoryDto;

    // Essential Variables
    const aggregateStages = [];
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
      if (filter['category._id']) {
        filter['category._id'] = new ObjectId(filter['category._id']);
      }

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

    // aggregateStages.push({
    //   $lookup: {
    //     from: 'categories',
    //     localField: 'CategoryId',
    //     foreignField: '_id',
    //     as: 'category',
    //   },
    // });
    try {
      const dataAggregates = await this.SubCategoryModel.aggregate(
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

  async getSubCategoryById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.SubCategoryModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getSubCategoryByName(
    name: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.SubCategoryModel.find({ name: name });
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

  async getUserSubCategoryById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.SubCategoryModel.findById(id);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getSubCategoriesByCategoryId(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.SubCategoryModel.find({ category: id }).select(
        select,
      );
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
   * updateSubCategoryById()
   * updateMultipleSubCategoryById()
   */
  async updateSubCategoryById(
    id: string,
    updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<ResponsePayload> {
    try {
      // const finalData = { ...updateSubCategoryDto };
      const { category } = updateSubCategoryDto;

      const categoryData = await this.categoryModel.findById(category);

      const mData = {
        ...updateSubCategoryDto,
        ...{
          category: categoryData,
        },
      };
      // const data = new this.SubCategoryModel(mData);

      await this.SubCategoryModel.findByIdAndUpdate(id, {
        $set: mData,
      });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async updateMultipleSubCategoryById(
    ids: string[],
    updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.SubCategoryModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateSubCategoryDto },
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
   * deleteSubCategoryById()
   * deleteMultipleSubCategoryById()
   */
  async deleteSubCategoryById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.SubCategoryModel.findById(id);
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
      await this.SubCategoryModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleSubCategoryById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.SubCategoryModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
