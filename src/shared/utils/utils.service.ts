import { Injectable, Logger } from '@nestjs/common';
import * as moment from 'moment-timezone';

@Injectable()
export class UtilsService {
  private logger = new Logger(UtilsService.name);

  constructor() {}

  /**
   * MOMENT DATE FUNCTIONS
   * getDateString
   */
  getDateString(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }
  getCurrentTime() {
    return new Date().toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  }

  getPdfDateString(date: Date, format?: string): string {
    const fm = format ? format : 'YYYY-MM-DD';
    return moment(date).format(fm);
  }

  getNextDateString(date: Date, day): string {
    return moment(date).add(day, 'days').format('YYYY-MM-DD');
  }

  getLocalDateTime(): Date {
    const newDate = moment().tz('Asia/Dhaka');
    return newDate.toDate();
  }

  getDateWithCurrentTime(date: Date): Date {
    const _ = moment().tz('Asia/Dhaka');
    // const newDate = moment(date).add({hours: _.hour(), minutes:_.minute() , seconds:_.second()});
    const newDate = moment(date).add({ hours: _.hour(), minutes: _.minute() });
    return newDate.toDate();
  }

  getDateMonth(fromZero: boolean, date?: any): number {
    let d;
    if (date) {
      d = new Date(date);
    } else {
      d = new Date();
    }
    const month = d.getMonth();
    return fromZero ? month : month + 1;
  }

  getDateYear(date?: any): number {
    let d;
    if (date) {
      d = new Date(date);
    } else {
      d = new Date();
    }
    return d.getFullYear();
  }

  getDateDifference(
    date1: Date | string,
    date2: Date | string,
    unit?: string,
  ): number {
    /**
     * If First Date is Current or Future Date
     * If Second Date is Expire or Old Date
     * Return Positive Value If Not Expired
     */
    const a = moment(date1).tz('Asia/Dhaka');
    const b = moment(date2).tz('Asia/Dhaka');

    switch (unit) {
      case 'seconds': {
        return b.diff(a, 'seconds');
      }
      case 'minutes': {
        return b.diff(a, 'minutes');
      }
      case 'hours': {
        return b.diff(a, 'hours');
      }
      case 'days': {
        return b.diff(a, 'days');
      }
      case 'weeks': {
        return b.diff(a, 'weeks');
      }
      default: {
        return b.diff(a, 'hours');
      }
    }
  }

  /**
   * STRING FUNCTIONS
   * transformToSlug
   */
  public transformToSlug(value: string, salt?: boolean): string {
    const slug = value
      .trim()
      .replace(/[^A-Z0-9]+/gi, '-')
      .toLowerCase();

    return salt ? `${slug}-${this.getRandomInt(1, 100)}` : slug;
  }

  /**
   * RANDOM FUNCTIONS
   */
  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * PAD LEADING
   */
  padLeadingZeros(num): string {
    return String(num).padStart(4, '0');
  }

  /**
   * METHODS
   * updateProductsOnOfferStart()
   */

  public async updateProductsOnOfferStart(products: any[]) {
    for (const product of products) {
      // await this.productModel.updateOne(
      //   { _id: product.product },
      //   {
      //     $set: {
      //       discountType: product.offerDiscountType,
      //       discountAmount: product.offerDiscountAmount,
      //     },
      //   },
      // );
    }
  }

  public async updateProductsOnOfferEnd(products: any[]) {
    for (const product of products) {
      if (product.resetDiscount) {
        // await this.productModel.updateOne(
        //   { _id: product.product },
        //   {
        //     $set: {
        //       discountType: null,
        //       discountAmount: null,
        //     },
        //   },
        // );
      }
    }
  }

  /**
   * GENERATE OTP
   * getRandomOtpCode4()
   * getRandomOtpCode6()
   */
  getRandomOtpCode4(): string {
    return (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
  }

  getRandomOtpCode6(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  addMinuteInCurrentTime(time: number): Date {
    const newDate = moment().tz('Asia/Dhaka').add(time, 'minutes');
    return newDate.toDate();
  }

  /**
   * ALL DATES IN MONTH YEAR
   * getDatesByMonth()
   */
  public getDatesByMonth(year: number, month: number) {
    const dateString: string[] = [];
    const date = new Date(year, month, 1);
    const dates = [];
    let i = 0;

    while (date.getMonth() === month) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
      // Push Data
      dateString.push(this.getDateString(dates[i]));
      i++;
    }
    return dateString;
  }
}
