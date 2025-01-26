import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductSchema } from '../../../schema/product.schema';
import { CategorySchema } from '../../../schema/category.schema';
import { SubCategorySchema } from '../../../schema/sub-category.schema';
import { BrandSchema } from '../../../schema/brand.schema';
import { UnitSchema } from '../../../schema/unit.schema';
import { UniqueIdSchema } from 'src/schema/unique-id.schema';
import { ProductPurchaseSchema } from '../../../schema/product-purchase.schema';
import { ProductDamageSchema } from '../../../schema/product-damage.schema';
import { ProductLogSchema } from '../../../schema/product-log.schema';
import { AdminSchema } from '../../../schema/admin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Product', schema: ProductSchema },
      { name: 'Category', schema: CategorySchema },
      { name: 'SubCategory', schema: SubCategorySchema },
      { name: 'Brand', schema: BrandSchema },
      { name: 'Unit', schema: UnitSchema },
      { name: 'UniqueId', schema: UniqueIdSchema },
      { name: 'ProductPurchase', schema: ProductPurchaseSchema },
      { name: 'ProductDamage', schema: ProductDamageSchema },
      { name: 'ProductLog', schema: ProductLogSchema },
      { name: 'Admin', schema: AdminSchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
