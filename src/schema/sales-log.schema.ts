import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { MULTI_PAY_SCHEMA } from './sub-schema.schema';

export const SalesLogSchema = new mongoose.Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    invoiceNo: {
      type: String,
      required: true,
    },
    deletedBy: {
      type: String,
      required: false,
    },
    deletedAt: {
      type: String,
      required: false,
    },
    deleteMonth: {
      type: String,
      required: false,
    },
    deleteYear: {
      type: String,
      required: false,
    },
    deleteDateString: {
      type: String,
      required: false,
    },
    customer: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: false,
      },
      phone: {
        type: String,
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      address: {
        type: String,
        required: false,
      },
    },
    salesman: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
    },
    products: [
      {
        saleType: {
          type: String,
          default: 'Sale',
          required: false,
        },
        _id: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: false,
        },
        soldQuantity: {
          type: Number,
          default: 0,
          required: true,
        },
        name: {
          type: String,
          required: false,
        },
        sku: {
          type: String,
          required: false,
        },
        images: [String],
        salePrice: {
          type: Number,
          default: 0,
          required: true,
        },
        discountAmount: {
          type: Number,
          default: 0,
          required: false,
        },
        purchasePrice: {
          type: Number,
          default: 0,
          required: true,
        },
        model: {
          type: String,
        },
        others: {
          type: String,
        },

        vendor: {
          _id: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
            required: false,
          },
          name: {
            type: String,
            required: false,
          },
          phone: {
            type: String,
            required: false,
          },
        },
        imei: {
          type: String,
        },
        colors: {
          _id: {
            type: Schema.Types.ObjectId,
            ref: 'Size',
            required: false,
          },
          name: {
            type: String,
            required: false,
          },
        },
        sizes: {
          _id: {
            type: Schema.Types.ObjectId,
            ref: 'Color',
            required: false,
          },
          name: {
            type: String,
            required: false,
          },
        },
        unit: {
          type: String,
        },
        category: {
          _id: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: false,
          },
          name: {
            type: String,
            required: false,
          },
        },
        subcategory: {
          _id: {
            type: Schema.Types.ObjectId,
            ref: 'SubCategory',
            required: false,
          },
          name: {
            type: String,
            required: false,
          },
        },
      },
    ],
    soldDate: {
      type: Date,
      required: true,
    },
    soldDateString: {
      type: String,
      required: true,
    },
    referenceNo: {
      type: String,
      required: false,
    },
    discountType: {
      type: Number,
      required: false,
    },
    visaCharge: {
      type: Number,
      required: false,
    },
    discountAmount: {
      type: Number,
      default: 0,
      required: false,
    },
    discount: {
      type: Number,
      default: 0,
      required: false,
    },

    vatAmount: {
      type: Number,
      default: 0,
      required: false,
    },

    usePoints: {
      type: Number,
      required: false,
    },

    pointsDiscount: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      required: false,
      default: 'Sales',
    },
    totalPurchasePrice: {
      type: Number,
      default: 0,
      required: true,
    },
    total: {
      type: Number,
      default: 0,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
      required: true,
    },
    subTotal: {
      type: Number,
      default: 0,
      required: true,
    },
    returnTotal: {
      type: Number,
      default: 0,
      required: false,
    },
    month: {
      type: Number,
      default: 0,
    },
    year: {
      type: Number,
      default: 0,
    },
    deliveryDate: {
      type: String,
      required: false,
    },
    soldTime: {
      type: String,
      required: false,
    },
    receivedFromCustomer: {
      type: Number,
      required: false,
      default: 0,
    },
    paymentType: {
      type: String,
      required: false,
      default: 'cash',
    },
    note: {
      type: String,
      required: false,
    },
    multiPayment: [MULTI_PAY_SCHEMA],
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
