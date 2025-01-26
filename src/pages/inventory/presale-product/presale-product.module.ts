import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PresaleProductController } from './presale-product.controller';
import { PresaleProductService } from './presale-product.service';
import { ProductSchema } from '../../../schema/product.schema';
import { CategorySchema } from '../../../schema/category.schema';
import { SubCategorySchema } from '../../../schema/sub-category.schema';
import { BrandSchema } from '../../../schema/brand.schema';
import { UnitSchema } from '../../../schema/unit.schema';
import { UniqueIdSchema } from 'src/schema/unique-id.schema';
import { ProductPurchaseSchema } from '../../../schema/product-purchase.schema';
import { PreSaleProductSchema } from '../../../schema/presale-product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PreSaleProduct', schema: PreSaleProductSchema },
      { name: 'Category', schema: CategorySchema },
      { name: 'SubCategory', schema: SubCategorySchema },
      { name: 'Brand', schema: BrandSchema },
      { name: 'Unit', schema: UnitSchema },
      { name: 'UniqueId', schema: UniqueIdSchema },
      { name: 'ProductPurchase', schema: ProductPurchaseSchema },
    ]),
  ],
  controllers: [PresaleProductController],
  providers: [PresaleProductService],
})
export class PresaleProductModule {}
