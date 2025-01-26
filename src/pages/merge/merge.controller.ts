import { Controller, Post, Body } from '@nestjs/common';
import { MergeService } from './merge.service';

@Controller('merge')
export class MergeController {
  constructor(private readonly mergeService: MergeService) {}

  @Post()
  async mergeDatabases(@Body() body: { subDbUris: string[] }): Promise<string> {
    await this.mergeService.initialize();

    for (const subDbUri of body.subDbUris) {
      await this.mergeService.mergeSubDatabase(subDbUri);
    }

    return 'Merge completed successfully!';
  }
}
