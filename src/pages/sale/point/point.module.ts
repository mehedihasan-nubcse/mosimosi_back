import { Module } from '@nestjs/common';
import { PointService } from './point.service';
import { PointController } from './point.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PointSchema } from '../../../schema/point.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Point', schema: PointSchema }]),
  ],
  providers: [PointService],
  controllers: [PointController],
})
export class PointModule {}
