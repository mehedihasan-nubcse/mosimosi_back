import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductPurchaseController } from './product-purchase.controller';
import { ProductPurchaseService } from './product-purchase.service';
import { ProductPurchaseSchema } from 'src/schema/product-purchase.schema';
import { ProductSchema } from '../../../schema/product.schema';
import { ProductPurchaseLogSchema } from '../../../schema/product-puchase-log.schema';
import { AdminSchema } from '../../../schema/admin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ProductPurchase', schema: ProductPurchaseSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'ProductPurchaseLog', schema: ProductPurchaseLogSchema },
      { name: 'Admin', schema: AdminSchema },
    ]),
  ],
  controllers: [ProductPurchaseController],
  providers: [ProductPurchaseService],
})
export class ProductPurchaseModule {}
