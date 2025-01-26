import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../../schema/user.schema';
import { AdminSchema } from '../../schema/admin.schema';
import { SalesSchema } from '../../schema/sales.schema';
import { ExpenseSchema } from 'src/schema/expense.schema';
import { ProductSchema } from 'src/schema/product.schema';
import { IncomeSchema } from '../../schema/income.schema';
import { ProductPurchaseSchema } from '../../schema/product-purchase.schema';
import { CourierSchema } from '../../schema/courier.schema';
import { VendorSchema } from '../../schema/vendor.schema';
import { TransactionsSchema } from '../../schema/transactions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Admin', schema: AdminSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Sales', schema: SalesSchema },
      { name: 'Expense', schema: ExpenseSchema },
      { name: 'Income', schema: IncomeSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'ProductPurchase', schema: ProductPurchaseSchema },
      { name: 'Courier', schema: CourierSchema },
      { name: 'Vendor', schema: VendorSchema },
      { name: 'Transactions', schema: TransactionsSchema },
    ]),
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
