import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const ProductDamageSchema = new mongoose.Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    product: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      imei: {
        type: String,
        required: false,
      },
      sku: {
        type: String,
        required: false,
      },
      purchasePrice: {
        type: Number,
        default: 0,
        required: false,
      },
      salePrice: {
        type: Number,
        default: 0,
        required: false,
      },
      discountType: {
        type: Number,
        required: false,
      },
      discountAmount: {
        type: Number,
        required: false,
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
      note: {
        type: String,
        required: false,
      },
    },
    quantity: {
      type: Number,
      default: 0,
      required: false,
    },
    month: {
      type: Number,
    },
    year: {
      type: Number,
    },
    dateString: {
      type: String,
      required: false,
    },
    updateTime: {
      type: String,
      required: false,
    },
    note: {
      type: String,
      required: false,
    },
    salesman: {
      type: String,
      required: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
