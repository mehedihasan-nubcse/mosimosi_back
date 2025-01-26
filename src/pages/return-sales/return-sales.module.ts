import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReturnSalesService } from './return-sales.service';
import { ReturnSalesSchema } from '../../schema/sales-return.schema';
import { ReturnSalesController } from './return-sales.controller';
import { CustomerSchema } from '../../schema/customer.schema';
import { AdminSchema } from '../../schema/admin.schema';
import { ProductSchema } from '../../schema/product.schema';
import { PointSchema } from '../../schema/point.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ReturnSales', schema: ReturnSalesSchema },
      { name: 'Customer', schema: CustomerSchema },
      { name: 'Admin', schema: AdminSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'Point', schema: PointSchema },
    ]),
  ],
  controllers: [ReturnSalesController],
  providers: [ReturnSalesService],
})
export class ReturnReturnSalesModule {}
