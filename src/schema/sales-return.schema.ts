import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const ReturnSalesSchema = new mongoose.Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
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
          required: false,
        },
        name: {
          type: String,
          required: false,
        },
        images: [String],
        salePrice: {
          type: Number,
          default: 0,
          required: false,
        },
        purchasePrice: {
          type: Number,
          default: 0,
          required: false,
        },
        imei: {
          type: String,
          required: false,
        },
      },
    ],
    returnDate: {
      type: Date,
      required: false,
    },
    returnDateString: {
      type: String,
      required: false,
    },
    subTotal: {
      type: Number,
      default: 0,
      required: false,
    },
    charge: {
      type: Number,
      default: 0,
      required: false,
    },
    totalPurchasePrice: {
      type: Number,
      default: 0,
      required: false,
    },
    grandTotal: {
      type: Number,
      default: 0,
      required: false,
    },
    month: {
      type: Number,
      required: false,
    },
    year: {
      type: Number,
      required: false,
    },
    deliveryDate: {
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
    },
    note: {
      type: String,
      required: false,
    },
    invoiceNo: {
      type: String,
      required: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
