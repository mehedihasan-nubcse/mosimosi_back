import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OutStockLogController } from './out-stock-log.controller';
import { OutStockLogService } from './out-stock-log.service';
import { OutStockLogSchema } from '../../../schema/out-stock-log.schema';
import { ProductDamageSchema } from '../../../schema/product-damage.schema';
import { ProductSchema } from '../../../schema/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'OutStockLog', schema: OutStockLogSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'ProductDamage', schema: ProductDamageSchema },
    ]),
  ],
  controllers: [OutStockLogController],
  providers: [OutStockLogService],
})
export class OutStockLogModule {}
