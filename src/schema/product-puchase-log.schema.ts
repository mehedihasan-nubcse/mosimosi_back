import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const ProductPurchaseLogSchema = new mongoose.Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
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
      note: {
        type: String,
        required: false,
      },
      others: {
        type: String,
        required: false,
      },
      model: {
        type: String,
        required: false,
      },
      purchasePrice: {
        type: Number,
        default: 0,
        min: 0,
        required: false,
      },
      salePrice: {
        type: Number,
        default: 0,
        min: 0,
        required: false,
      },
      colors: {
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
      sizes: {
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
    },
    previousQuantity: {
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
    updatedQuantity: {
      type: Number,
      default: 0,
      required: false,
    },
    createdAtString: {
      type: String,
      required: false,
    },
    createTime: {
      type: String,
      required: false,
    },
    dateString: {
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
