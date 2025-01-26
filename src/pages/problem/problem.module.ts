import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProblemController } from './problem.controller';
import { ProblemService } from './problem.service';
import { ProblemSchema } from '../../schema/problem.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Problem', schema: ProblemSchema }]),
  ],
  controllers: [ProblemController],
  providers: [ProblemService],
})
export class ProblemModule {}
