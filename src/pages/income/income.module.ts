import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IncomeController } from './income.controller';
import { IncomeService } from './income.service';
import { IncomeSchema } from '../../schema/income.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Income', schema: IncomeSchema }]),
  ],
  controllers: [IncomeController],
  providers: [IncomeService],
})
export class IncomeModule {}
