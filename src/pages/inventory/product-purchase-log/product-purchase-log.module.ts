import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductPurchaseLogController } from './product-purchase-log.controller';
import { ProductPurchaseLogService } from './product-purchase-log.service';
import { ProductPurchaseLogSchema } from '../../../schema/product-puchase-log.schema';
import { ProductPurchaseSchema } from '../../../schema/product-purchase.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ProductPurchaseLog', schema: ProductPurchaseLogSchema },  { name: 'ProductPurchase', schema: ProductPurchaseSchema },]),
  ],
  controllers: [ProductPurchaseLogController],
  providers: [ProductPurchaseLogService],
})
export class ProductPurchaseLogModule {}
