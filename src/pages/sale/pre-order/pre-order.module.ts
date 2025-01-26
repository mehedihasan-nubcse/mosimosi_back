import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerSchema } from '../../../schema/customer.schema';
import { UniqueIdSchema } from 'src/schema/unique-id.schema';
import { AdminSchema } from 'src/schema/admin.schema';
import { PreOrderService } from './pre-order.service';
import { PreOrderSchema } from 'src/schema/pre-order.schema';
import { PreOrderController } from './pre-order.controller';
import { PointSchema } from '../../../schema/point.schema';
import { PreSaleProductSchema } from '../../../schema/presale-product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PreOrder', schema: PreOrderSchema },
      { name: 'Customer', schema: CustomerSchema },
      { name: 'UniqueId', schema: UniqueIdSchema },
      { name: 'Admin', schema: AdminSchema },
      { name: 'Point', schema: PointSchema },
      { name: 'PreSaleProduct', schema: PreSaleProductSchema },
    ]),
  ],
  controllers: [PreOrderController],
  providers: [PreOrderService],
})
export class PreOrderModule {}
