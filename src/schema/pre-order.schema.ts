import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const PreOrderSchema = new mongoose.Schema(
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
        colors: {
          type: String,
        },
        sizes: {
          type: String,
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
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
