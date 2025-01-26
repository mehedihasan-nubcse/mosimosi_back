import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductLogController } from './product-log.controller';
import { ProductLogService } from './product-log.service';
import { ProductLogSchema } from '../../../schema/product-log.schema';
import { ProductSchema } from '../../../schema/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ProductLog', schema: ProductLogSchema },
      { name: 'Product', schema: ProductSchema },
    ]),
  ],
  controllers: [ProductLogController],
  providers: [ProductLogService],
})
export class ProductLogModule {}
