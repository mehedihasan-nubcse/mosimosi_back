import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesLogController } from './sales-log.controller';
import { SalesLogService } from './sales-log.service';
import { SalesLogSchema } from '../../../schema/sales-log.schema';
import { SalesSchema } from '../../../schema/sales.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'SalesLog', schema: SalesLogSchema }, { name: 'Sales', schema: SalesSchema },]),
  ],
  controllers: [SalesLogController],
  providers: [SalesLogService],
})
export class SalesLogModule {}
