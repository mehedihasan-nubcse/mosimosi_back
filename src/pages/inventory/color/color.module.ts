import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ColorController } from './color.controller';
import { ColorService } from './color.service';
import { ColorSchema } from '../../../schema/color.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Color', schema: ColorSchema }]),
  ],
  controllers: [ColorController],
  providers: [ColorService],
})
export class ColorModule {}
