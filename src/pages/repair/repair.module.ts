import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RepairController } from './repair.controller';
import { RepairService } from './repair.service';
import { RepairSchema } from '../../schema/repair.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Repair', schema: RepairSchema }]),
  ],
  controllers: [RepairController],
  providers: [RepairService],
})
export class RepairModule {}
