import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourierController } from './courier.controller';
import { CourierService } from './courier.service';
import { CourierSchema } from '../../schema/courier.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Courier', schema: CourierSchema }]),
  ],
  controllers: [CourierController],
  providers: [CourierService],
})
export class CourierModule {}
