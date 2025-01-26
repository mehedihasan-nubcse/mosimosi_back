import { Module } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { PayoutController } from './payout.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../../schema/user.schema';
import { PayoutSchema } from '../../schema/payout.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Payout', schema: PayoutSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [PayoutService],
  controllers: [PayoutController],
})
export class PayoutModule {}
