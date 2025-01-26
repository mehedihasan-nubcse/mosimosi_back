import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BuyBackController } from './buy-back.controller';
import { BuyBackService } from './buy-back.service';

import { UniqueIdSchema } from 'src/schema/unique-id.schema';
import { SubCategorySchema } from '../../schema/sub-category.schema';
import { BrandSchema } from '../../schema/brand.schema';
// import { ProductPurchaseSchema } from '../../schema/buyBack-purchase.schema';
import { UnitSchema } from '../../schema/unit.schema';
import { BuyBackSchema } from '../../schema/buy-back.schema';
// import { ProductDamageSchema } from '../../schema/buyBack-damage.schema';
import { CategorySchema } from '../../schema/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'BuyBack', schema: BuyBackSchema },
      { name: 'Category', schema: CategorySchema },
      { name: 'SubCategory', schema: SubCategorySchema },
      { name: 'Brand', schema: BrandSchema },
      { name: 'Unit', schema: UnitSchema },
      { name: 'UniqueId', schema: UniqueIdSchema },
      // { name: 'ProductPurchase', schema: ProductPurchaseSchema },
      // { name: 'ProductDamage', schema: ProductDamageSchema },
    ]),
  ],
  controllers: [BuyBackController],
  providers: [BuyBackService],
})
export class BuyBackModule {}
