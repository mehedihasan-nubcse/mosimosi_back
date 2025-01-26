import { VendorModule } from './pages/vendor/vendor.module';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './pages/user/user.module';
import { AdminModule } from './pages/admin/admin.module';
import { UtilsModule } from './shared/utils/utils.module';
import { UploadModule } from './pages/upload/upload.module';
import { DbToolsModule } from './shared/db-tools/db-tools.module';
import { PromoOfferModule } from './pages/offers/promo-offer/promo-offer.module';
import { JobSchedulerModule } from './shared/job-scheduler/job-scheduler.module';
import { DashboardModule } from './pages/dashboard/dashboard.module';
import { RegistrationModule } from './pages/registration/registration.module';
import { CategoryModule } from './pages/inventory/category/category.module';
import { BrandModule } from './pages/inventory/brand/brand.module';
import { SubCategoryModule } from './pages/inventory/sub-category/sub-category.module';
import { ProductModule } from './pages/inventory/product/product.module';
import { CustomerModule } from './pages/customer/customer.module';
import { SupplierModule } from './pages/supplier/supplier.module';
import { SalesModule } from './pages/sale/sales/sales.module';
import { ReturnReturnSalesModule } from './pages/return-sales/return-sales.module';
import { ExpenseModule } from './pages/expense/expense.module';
import { UnitModule } from './pages/unit/unit.module';
import { SalesmanModule } from './pages/salesman/salesman.module';
import { PreOrderModule } from './pages/sale/pre-order/pre-order.module';
import { TransactionsModule } from './pages/transactions/transactions.module';
import { ProductPurchaseModule } from './pages/inventory/product-purchase/product-purchase.module';
import { AttributeModule } from './pages/inventory/attribute/attribute.module';
import { PointModule } from './pages/sale/point/point.module';
import { IncomeModule } from './pages/income/income.module';
import { FileFolderModule } from './pages/file-folder/file-folder.module';
import { GalleryModule } from './pages/gallery/gallery.module';
import { SizeModule } from './pages/inventory/size/size.module';
import { ColorModule } from './pages/inventory/color/color.module';
import { ProductDamageModule } from './pages/inventory/product-damage/product-damage.module';
import { PresaleProductModule } from './pages/inventory/presale-product/presale-product.module';
import { ShopInformationModule } from './pages/customization/shop-information/shop-information.module';
import { CourierModule } from './pages/courier/courier.module';
import { PayoutModule } from './pages/payout/payout.module';
import { BuyBackModule } from './pages/buy-back/buy-back..module';
import { RepairModule } from './pages/repair/repair.module';
import { NotesModule } from './pages/notes/notes.module';
import { ShopModule } from './pages/shop/shop.module';
import { MergeService } from './pages/merge/merge.service';
import { MergeController } from './pages/merge/merge.controller';
import { ProblemModule } from './pages/problem/problem.module';
import { PatternModule } from './pages/pattern/pattern.module';
import { ProductLogModule } from './pages/inventory/product-log/product-log.module';
import { OutStockLogModule } from './pages/inventory/out-stock-log/out-stock-log.module';
import { SalesLogModule } from './pages/inventory/sales-log/sales-log.module';
import { ProductPurchaseLogModule } from './pages/inventory/product-purchase-log/product-purchase-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),

    MongooseModule.forRoot(configuration().mongoCluster),
    CacheModule.register({ ttl: 200, max: 10, isGlobal: true }),
    AdminModule,
    UserModule,
    UtilsModule,
    DbToolsModule,
    UploadModule,
    PromoOfferModule,
    JobSchedulerModule,
    DashboardModule,
    RegistrationModule,
    // new add
    CategoryModule,
    AttributeModule,
    BrandModule,
    SubCategoryModule,
    ProductModule,
    CustomerModule,
    SupplierModule,
    SalesModule,
    ReturnReturnSalesModule,
    ExpenseModule,
    IncomeModule,
    UnitModule,
    VendorModule,
    SalesmanModule,
    PreOrderModule,
    TransactionsModule,
    ProductPurchaseModule,
    PointModule,
    FileFolderModule,
    GalleryModule,
    SizeModule,
    ColorModule,
    ProductDamageModule,
    PresaleProductModule,
    ShopInformationModule,
    CourierModule,
    PayoutModule,
    BuyBackModule,
    RepairModule,
    NotesModule,
    ShopModule,
    ProblemModule,
    PatternModule,
    ProductLogModule,
    OutStockLogModule,
    SalesLogModule,
    ProductPurchaseLogModule,
  ],

  controllers: [MergeController],
  providers: [MergeService],
})
export class AppModule {}
