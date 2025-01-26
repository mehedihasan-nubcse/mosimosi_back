import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const PreSaleProductSchema = new mongoose.Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    brand: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Brand',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
    },

    attribute: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Attribute',
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
    unit: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
    },
    sku: {
      type: String,
      required: false,
    },
    others: {
      type: String,
      required: false,
    },

    quantity: {
      type: Number,
      default: 0,
      required: false,
    },
    model: {
      type: String,
      required: false,
    },
    productCode: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    purchasePrice: {
      type: Number,
      default: 0,
      min: 1,
      required: false,
    },
    salePrice: {
      type: Number,
      default: 0,
      min: 1,
      required: false,
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
    minQuantity: {
      type: Number,
      default: 0,
      required: false,
    },
    soldQuantity: {
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
    currency: {
      type: String,
      required: false,
    },
    dateString: {
      type: String,
      required: false,
    },
    createdAtString: {
      type: String,
      required: false,
    },
    updatedAtString: {
      type: String,
      required: false,
    },
    images: [String],
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
  {
    versionKey: false,
    timestamps: true,
  },
);
