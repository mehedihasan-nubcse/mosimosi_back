import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SizeController } from './size.controller';
import { SizeService } from './size.service';
import { SizeSchema } from '../../../schema/size.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Size', schema: SizeSchema }]),
  ],
  controllers: [SizeController],
  providers: [SizeService],
})
export class SizeModule {}
