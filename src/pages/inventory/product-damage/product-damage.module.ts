import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductDamageController } from './product-damage.controller';
import { ProductDamageService } from './product-damage.service';
import { ProductDamageSchema } from 'src/schema/product-damage.schema';
import { ProductSchema } from '../../../schema/product.schema';
import { OutStockLogSchema } from '../../../schema/out-stock-log.schema';
import { AdminSchema } from '../../../schema/admin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ProductDamage', schema: ProductDamageSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'OutStockLog', schema: OutStockLogSchema },
      { name: 'Admin', schema: AdminSchema },
    ]),
  ],
  controllers: [ProductDamageController],
  providers: [ProductDamageService],
})
export class ProductDamageModule {}
