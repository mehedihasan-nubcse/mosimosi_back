import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsSchema } from 'src/schema/transactions.schema';
import { VendorSchema } from 'src/schema/vendor.schema';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Transactions', schema: TransactionsSchema },
      { name: 'Vendor', schema: VendorSchema },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
