import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';
import { UnitSchema } from '../../schema/unit.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Unit', schema: UnitSchema }])],
  controllers: [UnitController],
  providers: [UnitService],
})
export class UnitModule {}
