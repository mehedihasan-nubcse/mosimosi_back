import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { JwtModule } from '@nestjs/jwt';

import { ShopSchema } from './schema/shop.schema';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Shop', schema: ShopSchema }]),
  ],
  providers: [ShopService],
  controllers: [ShopController],
})
export class ShopModule {}
