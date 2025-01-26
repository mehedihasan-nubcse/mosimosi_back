import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from '../../../shared/utils/utils.service';
import { Point } from '../../../interfaces/common/point.interface';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { ErrorCodes } from '../../../enum/error-code.enum';
import {
  AddPointDto,
  FilterAndPaginationPointDto,
} from '../../../dto/point.dto';

const ObjectId = Types.ObjectId;

@Injectable()
export class PointService {
  private logger = new Logger(PointService.name);

  constructor(
    @InjectModel('Point')
    private readonly pointModel: Model<Point>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * addPoint
   * insertManyPoint
   */
  async addPoint(
    shop: string,
    addPointDto: AddPointDto,
  ): Promise<ResponsePayload> {
    try {
      const pointData = await this.pointModel.findOne();
      if (pointData) {
        await this.pointModel.findByIdAndUpdate(pointData._id, {
          $set: addPointDto,
        });
        const data = {
          _id: pointData._id,
        };

        return {
          success: true,
          message: 'Data Updated Success',
          data,
        } as ResponsePayload;
      } else {
        const newData = new this.pointModel({
          ...addPointDto,
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
          message: 'Data Added Success',
          data,
        } as ResponsePayload;
      }
    } catch (error) {
      console.log(error);
      if (error.code && error.code.toString() === ErrorCodes.UNIQUE_FIELD) {
        throw new ConflictException('Slug Must be Unique');
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  /**
   * getPoint
   * getPointById
   */

  async getAllPointByShop(
    shop: string,
    filterPointDto: FilterAndPaginationPointDto,
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
      const { filter } = filterPointDto;
      filterPointDto.filter = { ...filter, ...{ shop: shop } };

      // return this.getAllPoints(filterPointDto, searchQuery);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPoint(shop: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.pointModel.findOne({ shop: shop });
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
