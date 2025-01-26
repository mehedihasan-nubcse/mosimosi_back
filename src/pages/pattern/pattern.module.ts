import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatternController } from './pattern.controller';
import { PatternService } from './pattern.service';
import { PatternSchema } from '../../schema/pattern.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Pattern', schema: PatternSchema }]),
  ],
  controllers: [PatternController],
  providers: [PatternService],
})
export class PatternModule {}
