import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from '../../shared/utils/utils.service';
import { User } from '../../interfaces/user/user.interface';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { Admin } from '../../interfaces/admin/admin.interface';
import { Sales } from '../../interfaces/common/sales.interface';
import { Expense } from 'src/interfaces/common/expense.interface';
import { Product } from 'src/interfaces/common/product.interface';
import { Income } from '../../interfaces/common/income.interface';
import { ProductPurchase } from '../../interfaces/common/product-purchase.interface';
import { Courier } from '../../interfaces/common/courier.interface';
import { Vendor } from '../../interfaces/common/vendor.interface';
import { Transactions } from '../../interfaces/common/transactions.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class DashboardService {
  private logger = new Logger(DashboardService.name);

  constructor(
    @InjectModel('Admin')
    private readonly adminModel: Model<Admin>,
    @InjectModel('User')
    private readonly userModel: Model<User>,
    @InjectModel('Sales')
    private readonly salesModel: Model<Sales>,
    @InjectModel('Expense')
    private readonly expenseModel: Model<Expense>,
    @InjectModel('Income')
    private readonly incomeModel: Model<Income>,
    @InjectModel('Product')
    private readonly productModel: Model<Product>,
    @InjectModel('Courier')
    private readonly courierModel: Model<Courier>,
    @InjectModel('Vendor')
    private readonly vendorModel: Model<Vendor>,
    @InjectModel('Transactions')
    private readonly transactionsModel: Model<Transactions>,
    @InjectModel('ProductPurchase')
    private readonly productPurchaseModel: Model<ProductPurchase>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  // async getSalesDashboard(
  //   day: number,
  //   admin?: any,
  //   shop: string,
  // ): Promise<ResponsePayload> {
  //   try {
  //     let dateFilterSale;
  //     let dateFilterDateString;
  //     const today = this.utilsService.getDateString(new Date());
  //     if (day === 0) {
  //       const nextDay = this.utilsService.getNextDateString(new Date(), 1);
  //       dateFilterSale = {
  //         soldDateString: { $gte: today, $lt: nextDay },
  //       };
  //       dateFilterDateString = {
  //         dateString: { $gte: today, $lt: nextDay },
  //       };
  //     } else if (day === 1) {
  //       const previousDay = this.utilsService.getNextDateString(new Date(), -1);
  //       dateFilterSale = {
  //         soldDateString: { $gte: previousDay, $lt: today },
  //       };
  //       dateFilterDateString = {
  //         dateString: { $gte: previousDay, $lt: today },
  //       };
  //     } else if (day > 1) {
  //       const pDay = this.utilsService.getNextDateString(new Date(), -day);
  //       dateFilterSale = { soldDateString: { $gte: pDay } };
  //       dateFilterDateString = { dateString: { $gte: pDay } };
  //     } else {
  //       dateFilterSale = { soldDateString: { $gte: today } };
  //       dateFilterDateString = { dateString: { $gte: today } };
  //     }
  //
  //     // Calculations
  //     const aggregateStagesCalculation = [];
  //     const aggregateStagesExpense = [];
  //     const aggregateStagesIncome = [];
  //     const aggregateStagesCourier = [];
  //     const aggregateStagesTransaction = [];
  //     const aggregateStagesPurchase = [];
  //
  //     // if (admin.role === 'salesman') {
  //     //   aggregateStagesCalculation.push({
  //     //     $match: {
  //     //       'salesman._id': new ObjectId(admin._id),
  //     //       ...dateFilterSale,
  //     //     },
  //     //   });
  //     // } else {
  //     //   aggregateStagesCalculation.push({
  //     //     $match: dateFilterSale,
  //     //   });
  //     // }
  //
  //     aggregateStagesCalculation.push({
  //       $match: dateFilterSale,
  //     });
  //
  //     const group = {
  //       $group: {
  //         _id: null,
  //         totalSale: { $sum: '$total' },
  //         totalCost: { $sum: '$totalPurchasePrice' },
  //         totalLoss: {
  //           $sum: {
  //             $subtract: ['$totalPurchasePrice', '$total'],
  //           },
  //         },
  //         totalProfit: {
  //           $sum: {
  //             $subtract: ['$total', '$totalPurchasePrice'],
  //           },
  //         },
  //       },
  //     };
  //
  //     aggregateStagesCalculation.push(group);
  //
  //     // Expense
  //     aggregateStagesExpense.push({
  //       $match: {
  //         ...dateFilterDateString,
  //       },
  //     });
  //
  //     aggregateStagesExpense.push({
  //       $group: {
  //         _id: null,
  //         totalExpense: { $sum: '$amount' },
  //       },
  //     });
  //
  //     // Income
  //     aggregateStagesIncome.push({
  //       $match: {
  //         ...dateFilterDateString,
  //       },
  //     });
  //
  //     aggregateStagesIncome.push({
  //       $group: {
  //         _id: null,
  //         totalIncome: { $sum: '$amount' },
  //       },
  //     });
  //
  //     // Courier
  //     aggregateStagesCourier.push({
  //       $match: {
  //         ...dateFilterDateString,
  //       },
  //     });
  //
  //     aggregateStagesCourier.push({
  //       $group: {
  //         _id: null,
  //         totalCourier: { $sum: '$amount' },
  //       },
  //     });
  //
  //     // Vendor
  //     aggregateStagesTransaction.push({
  //       $match: {
  //         ...dateFilterDateString,
  //       },
  //     });
  //
  //     aggregateStagesTransaction.push({
  //       $group: {
  //         _id: null,
  //         totalVendorPayable: { $sum: '$payableAmount' },
  //         totalVendorPaid: { $sum: '$paidAmount' },
  //       },
  //     });
  //
  //     aggregateStagesPurchase.push({
  //       $match: {
  //         ...dateFilterDateString,
  //       },
  //     });
  //
  //     aggregateStagesPurchase.push({
  //       $group: {
  //         _id: null,
  //         totalPurchase: {
  //           $sum: {
  //             $multiply: [
  //               '$product.purchasePrice',
  //               { $subtract: ['$updatedQuantity', '$previousQuantity'] },
  //             ],
  //           },
  //         },
  //       },
  //     });
  //
  //     const calculateAggregates = await this.salesModel.aggregate(
  //       aggregateStagesCalculation,
  //     );
  //
  //     const calculateExpense = await this.expenseModel.aggregate(
  //       aggregateStagesExpense,
  //     );
  //
  //     const calculateIncome = await this.incomeModel.aggregate(
  //       aggregateStagesIncome,
  //     );
  //
  //     const calculateCourier = await this.courierModel.aggregate(
  //       aggregateStagesCourier,
  //     );
  //
  //     const calculateTransaction = await this.transactionsModel.aggregate(
  //       aggregateStagesTransaction,
  //     );
  //
  //     const calculatePurchase = await this.productPurchaseModel.aggregate(
  //       aggregateStagesPurchase,
  //     );
  //
  //     return {
  //       success: true,
  //       message: 'Data Retrieve Success',
  //       data: {
  //         ...calculateAggregates[0],
  //         ...calculateExpense[0],
  //         ...calculateIncome[0],
  //         ...calculatePurchase[0],
  //         ...calculateCourier[0],
  //         ...calculateTransaction[0],
  //       },
  //     } as ResponsePayload;
  //   } catch (error) {
  //     console.log(error);
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }
  //
  //

  async getSalesDashboard(
    day: number,
    admin?: any,
    shop?: any,
  ): Promise<ResponsePayload> {
    try {
      let dateFilterSale;
      let dateFilterDateString;
      const today = this.utilsService.getDateString(new Date());
      if (day === 0) {
        const nextDay = this.utilsService.getNextDateString(new Date(), 1);
        dateFilterSale = {
          soldDateString: { $gte: today, $lt: nextDay },
        };
        dateFilterDateString = {
          dateString: { $gte: today, $lt: nextDay },
        };
      } else if (day === 1) {
        const previousDay = this.utilsService.getNextDateString(new Date(), -1);
        dateFilterSale = {
          soldDateString: { $gte: previousDay, $lt: today },
        };
        dateFilterDateString = {
          dateString: { $gte: previousDay, $lt: today },
        };
      } else if (day > 1) {
        const pDay = this.utilsService.getNextDateString(new Date(), -day);
        dateFilterSale = { soldDateString: { $gte: pDay } };
        dateFilterDateString = { dateString: { $gte: pDay } };
      } else {
        dateFilterSale = { soldDateString: { $gte: today } };
        dateFilterDateString = { dateString: { $gte: today } };
      }

      // Add shop filter to each aggregate stage
      const shopFilter = { shop: new ObjectId(shop) }; // assuming shop is stored as an ObjectId

      const aggregateStagesCalculation = [
        { $match: { ...dateFilterSale, ...shopFilter } },
        {
          $group: {
            _id: null,
            totalSale: { $sum: '$total' },
            totalCost: { $sum: '$totalPurchasePrice' },
            totalLoss: {
              $sum: { $subtract: ['$totalPurchasePrice', '$total'] },
            },
            totalProfit: {
              $sum: { $subtract: ['$total', '$totalPurchasePrice'] },
            },
          },
        },
      ];

      const aggregateStagesExpense = [
        { $match: { ...dateFilterDateString, ...shopFilter } },
        {
          $group: {
            _id: null,
            totalExpense: { $sum: '$amount' },
          },
        },
      ];

      const aggregateStagesIncome = [
        { $match: { ...dateFilterDateString, ...shopFilter } },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: '$amount' },
          },
        },
      ];

      const aggregateStagesCourier = [
        { $match: { ...dateFilterDateString, ...shopFilter } },
        {
          $group: {
            _id: null,
            totalCourier: { $sum: '$amount' },
          },
        },
      ];

      const aggregateStagesTransaction = [
        { $match: { ...dateFilterDateString, ...shopFilter } },
        {
          $group: {
            _id: null,
            totalVendorPayable: { $sum: '$payableAmount' },
            totalVendorPaid: { $sum: '$paidAmount' },
          },
        },
      ];

      const aggregateStagesPurchase = [
        { $match: { ...dateFilterDateString, ...shopFilter } },
        {
          $group: {
            _id: null,
            totalPurchase: {
              $sum: {
                $multiply: [
                  '$product.purchasePrice',
                  { $subtract: ['$updatedQuantity', '$previousQuantity'] },
                ],
              },
            },
          },
        },
      ];
      // Aggregate stages for additional calculations
      const aggregateStagesStockAmount = [
        { $match: { ...shopFilter } },
        {
          $group: {
            _id: null,
            totalStockAmount: {
              $sum: { $multiply: ['$quantity', '$purchasePrice'] },
            },
          },
        },
      ];

      // Aggregation for Total New Phone Category Amount
      const aggregateStagesNewPhoneCategory = [
        {
          $match: {
            'category.name': {
              $in: [
                'NEW PHONE',
                // ' NEW PHONE ',
                // ' NEW PHONE  ',
                // '  NEW PHONE ',
                // ' NEW PHONE',
                // 'NEW PHONE ',
                // '  NEW PHONE  ',
                // '  NEW PHONE',
                // '  NEW PHONE ',
                // 'NEW PHONE  ',
                // ' NEW PHONE  ',
              ],
            },
            ...shopFilter,
          },
        },
        {
          $group: {
            _id: null,
            totalNewPhoneAmount: {
              $sum: { $multiply: ['$quantity', '$purchasePrice'] },
            },
          },
        },
      ];

      const aggregateStages2HandCategory = [
        {
          $match: {
            'category.name': {
              $in: [
                '2HAND',
                // ' 2HAND ',
                // ' 2HAND  ',
                // ' 2HAND',
                // '2HAND ',
                // '  2HAND  ',
                // '  2HAND',
                // '  2HAND ',
                // '2HAND  ',
                // ' 2HAND  ',
              ],
            },
            ...shopFilter,
          },
        },
        {
          $group: {
            _id: null,
            total2HandAmount: {
              $sum: { $multiply: ['$quantity', '$purchasePrice'] },
            },
          },
        },
      ];

      // console.log('werqw3e', aggregateStagesNewPhoneCategory);

      // Aggregation for Total New Phone Category Amount
      const aggregateStagesAccessoriesCategory = [
        {
          $match: {
            'category.name': {
              $in: [
                'ACCESSORIES',
                // ' ACCESSORIES',
                // ' ACCESSORIES ',
                // 'ACCESSORIES ',
                // '  ACCESSORIES  ',
                // '  ACCESSORIES',
                // 'ACCESSORIES  ',
                // ' ACCESSORIES  ',
                // '  ACCESSORIES ',
              ],
            },
            ...shopFilter,
          },
        },
        {
          $group: {
            _id: null,
            totalAccessoriesAmount: {
              $sum: { $multiply: ['$quantity', '$purchasePrice'] },
            },
          },
        },
      ];

      // Aggregation for Total New Phone Category Amount
      const aggregateStagesDisplaysCategory = [
        {
          $match: {
            'category.name': {
              $in: [
                'DISPLAY SET',
                // ' DISPLAY SET',
                // ' DISPLAY SET ',
                // 'DISPLAY SET ',
                // '  DISPLAY SET  ',
                // '  DISPLAY SET',
                // 'DISPLAY SET  ',
                // ' DISPLAY SET  ',
                // '  DISPLAY SET ',
              ],
            },
            ...shopFilter,
          },
        },
        {
          $group: {
            _id: null,
            totalDisplayAmount: {
              $sum: { $multiply: ['$quantity', '$purchasePrice'] },
            },
          },
        },
      ];
      // Aggregation for Total New Phone Category Amount
      const aggregateStagesExportCategory = [
        {
          $match: {
            'category.name': {
              $in: [
                'EXPORT SET CHINA'.trim(),
                // ' EXPORT SET CHINA',
                // ' EXPORT SET CHINA ',
                // 'EXPORT SET CHINA ',
                // '  EXPORT SET CHINA  ',
                // '  EXPORT SET CHINA',
                // 'EXPORT SET CHINA  ',
                // ' EXPORT SET CHINA  ',
                // '  EXPORT SET CHINA ',
              ],
            },
            ...shopFilter,
          },
        },
        {
          $group: {
            _id: null,
            totalExportAmount: {
              $sum: { $multiply: ['$quantity', '$purchasePrice'] },
            },
          },
        },
      ];

      // Aggregation for Total New Phone Category Amount
      const aggregateStagesRepairCategory = [
        // { $match: { 'category.name': 'REPAIR', ...shopFilter } },
        {
          $match: {
            'category.name': {
              $in: [
                'REPAIR'.trim(),
                // ' REPAIR',
                // ' REPAIR ',
                // 'REPAIR ',
                // '  REPAIR ',
                // 'REPAIR  ',
                // '  REPAIR',
                // '  REPAIR  ',
                // ' REPAIR  ',
              ],
            },
            ...shopFilter,
          },
        },
        {
          $group: {
            _id: null,
            totalRepairAmount: {
              $sum: { $multiply: ['$quantity', '$purchasePrice'] },
            },
          },
        },
      ];

      // Execute additional aggregations
      const calculateStockAmount = await this.productModel.aggregate(
        aggregateStagesStockAmount,
      );

      const calculate2HandAmount = await this.productModel.aggregate(
        aggregateStages2HandCategory,
      );

      const calculateDisplayAmount = await this.productModel.aggregate(
        aggregateStagesDisplaysCategory,
      );
      const calculateExportAmount = await this.productModel.aggregate(
        aggregateStagesExportCategory,
      );

      const calculateNewPhoneCategory = await this.productModel.aggregate(
        aggregateStagesNewPhoneCategory,
      );
      const calculateAccessoriesCategory = await this.productModel.aggregate(
        aggregateStagesAccessoriesCategory,
      );
      const calculateRepairCategory = await this.productModel.aggregate(
        aggregateStagesRepairCategory,
      );
      // Execute all aggregations
      const calculateAggregates = await this.salesModel.aggregate(
        aggregateStagesCalculation,
      );
      const calculateExpense = await this.expenseModel.aggregate(
        aggregateStagesExpense,
      );
      const calculateIncome = await this.incomeModel.aggregate(
        aggregateStagesIncome,
      );
      const calculateCourier = await this.courierModel.aggregate(
        aggregateStagesCourier,
      );
      const calculateTransaction = await this.transactionsModel.aggregate(
        aggregateStagesTransaction,
      );
      const calculatePurchase = await this.productPurchaseModel.aggregate(
        aggregateStagesPurchase,
      );

      return {
        success: true,
        message: 'Data Retrieve Success',
        data: {
          ...calculateAggregates[0],
          ...calculateExpense[0],
          ...calculateIncome[0],
          ...calculatePurchase[0],
          ...calculateCourier[0],
          ...calculateTransaction[0],
          totalStockAmount: calculateStockAmount[0]?.totalStockAmount || 0,
          totalNewPhoneAmount:
            calculateNewPhoneCategory[0]?.totalNewPhoneAmount || 0,
          total2HandAmount: calculate2HandAmount[0]?.total2HandAmount || 0,
          totalAccessoriesAmount:
            calculateAccessoriesCategory[0]?.totalAccessoriesAmount || 0,
          totalExportAmount: calculateExportAmount[0]?.totalExportAmount || 0,
          totalDisplayAmount:
            calculateDisplayAmount[0]?.totalDisplayAmount || 0,
          totalRepairAmount: calculateRepairCategory[0]?.totalRepairAmount || 0,
          ...{ shop },
        },
      } as ResponsePayload;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
  async getStatement(
    filter: { month: number },
    shop: string,
  ): Promise<ResponsePayload> {
    try {
      const dates = this.utilsService.getDatesByMonth(
        new Date().getFullYear(),
        filter.month,
      );

      // Add the shop ID filter in each find operation
      const sales = JSON.parse(
        JSON.stringify(
          await this.salesModel.find({ month: filter.month + 1, shop }),
        ),
      );

      const expenses = JSON.parse(
        JSON.stringify(
          await this.expenseModel.find({ month: filter.month + 1, shop }),
        ),
      );

      const incomes = JSON.parse(
        JSON.stringify(
          await this.incomeModel.find({ month: filter.month + 1, shop }),
        ),
      );

      const purchases = JSON.parse(
        JSON.stringify(
          await this.productPurchaseModel.find({
            month: filter.month + 1,
            shop,
          }),
        ),
      );

      const reports: any[] = [];

      for (const date of dates) {
        const filteredSales = sales.filter((f) => f.soldDateString === date);
        const filteredExpense = expenses.filter((f) => f.dateString === date);
        const filteredIncome = incomes.filter((f) => f.dateString === date);
        const filteredPurchase = purchases.filter(
          (f) => f.createdAtString === date,
        );

        const report = {
          shop,
          date: date,
          soldAmount: filteredSales
            .map((t) => t.total ?? 0)
            .reduce((acc, value) => acc + value, 0),
          soldPurchaseAmount: filteredSales
            .map((t) => t.totalPurchasePrice ?? 0)
            .reduce((acc, value) => acc + value, 0),
          expense: filteredExpense
            .map((t) => t.amount ?? 0)
            .reduce((acc, value) => acc + value, 0),
          income: filteredIncome
            .map((t) => t.amount ?? 0)
            .reduce((acc, value) => acc + value, 0),
          purchaseAmount: filteredPurchase
            .map((t) => t.product.purchasePrice ?? 0)
            .reduce((acc, value) => acc + value, 0),
        };
        reports.push(report);
      }

      return {
        success: true,
        message: 'Data Retrieve Success',
        data: reports,
      } as ResponsePayload;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
