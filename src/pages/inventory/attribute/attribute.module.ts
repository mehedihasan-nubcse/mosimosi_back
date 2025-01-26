import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttributeController } from './attribute.controller';
import { AttributeService } from './attribute.service';
import { AttributeSchema } from '../../../schema/attribute.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Attribute', schema: AttributeSchema }]),
  ],
  controllers: [AttributeController],
  providers: [AttributeService],
})
export class AttributeModule {}
