import { Injectable, Logger } from '@nestjs/common';
import * as schedule from 'node-schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobScheduler } from '../../interfaces/core/job-scheduler.interface';
import { ConfigService } from '@nestjs/config';
import { PromoOffer } from '../../interfaces/common/promo-offer.interface';
import { UtilsService } from '../utils/utils.service';
import { DbToolsService } from '../db-tools/db-tools.service';

@Injectable()
export class JobSchedulerService {
  private logger = new Logger(JobSchedulerService.name);

  constructor(
    @InjectModel('JobScheduler')
    private readonly jobSchedulerModel: Model<JobScheduler>,
    @InjectModel('PromoOffer')
    private readonly promoOfferModel: Model<PromoOffer>,
    private configService: ConfigService,
    private utilsService: UtilsService,
    private dbToolsService: DbToolsService,
  ) {}

  /**
   * CORN JOB
   * autoBackupDatabaseToDrive()
   * addOfferScheduleOnStart()
   * addOfferScheduleOnEnd()
   * cancelOfferJobScheduler()
   * reAddScheduler()
   */

  async autoBackupDatabaseToDrive() {
    schedule.scheduleJob('00 00 12 * * 0-6', async () => {
      console.log('Database Backing up...');
      await this.dbToolsService.backupMongoDb();
    });
  }

  async addOfferScheduleOnStart(
    isNew: boolean,
    id: string,
    expTime: Date,
    products: any[],
    jobId?: string,
  ) {
    const jobName = this.configService.get<string>('promoOfferScheduleOnStart');
    let saveJob;
    if (isNew) {
      const data: JobScheduler = {
        name: jobName,
        collectionName: 'PromoOffer',
        id: id,
      };

      // Save on DB
      const jobScheduler = new this.jobSchedulerModel(data);
      saveJob = await jobScheduler.save();
    }

    schedule.scheduleJob(jobName, expTime, async () => {
      this.logger.log('DOING at -> ' + jobName + '---' + expTime.toString());
      await this.utilsService.updateProductsOnOfferStart(products);
      await this.jobSchedulerModel.deleteOne({
        _id: isNew ? saveJob._id : jobId,
      });
    });
  }

  async addOfferScheduleOnEnd(
    isNew: boolean,
    id: string,
    expTime: Date,
    jobId?: string,
  ) {
    const jobName = this.configService.get<string>('promoOfferScheduleOnEnd');
    let saveJob;
    if (isNew) {
      const data: JobScheduler = {
        name: jobName,
        collectionName: 'PromoOffer',
        id: id,
      };

      // Save on DB
      const jobScheduler = new this.jobSchedulerModel(data);
      saveJob = await jobScheduler.save();
    }

    schedule.scheduleJob(jobName, expTime, async () => {
      this.logger.log('DOING at -> ' + jobName + '---' + expTime.toString());
      await this.jobSchedulerModel.deleteOne({
        _id: isNew ? saveJob._id : jobId,
      });
      await this.promoOfferModel.findByIdAndDelete(id);
    });
  }

  async cancelOfferJobScheduler(name: string) {
    schedule.cancelJob(name);
    await this.jobSchedulerModel.deleteOne({
      collectionName: 'PromoOffer',
      name: name,
    });
  }
}
