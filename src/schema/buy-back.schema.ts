import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const BuyBackSchema = new mongoose.Schema(
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
      required: false,
    },

    personName: {
      type: String,
      required: false,
    },

    payby: {
      type: String,
      required: false,
    },
    customerName: {
      type: String,
      required: false,
    },
    nric: {
      type: String,
      required: false,
    },
    phoneNo: {
      type: String,
      required: false,
    },
    postCode: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    unitNo: {
      type: String,
      required: false,
    },
    admin: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: false,
      },
      username: {
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
      type: String,
      required: false,
    },
    imei: {
      type: String,
      required: false,
    },
    salesman: {
      type: String,
      required: false,
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
      min: 0,
      default: 0,
      required: false,
    },
    salePrice: {
      type: Number,
      default: 0,
      min: 0,
      required: false,
    },
    salePercent: {
      type: Number,
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
    editSalePrice: {
      type: Boolean,
      required: false,
    },
    dateString: {
      type: String,
      required: false,
    },
    productType: {
      type: String,
      required: false,
    },
    expireDate: {
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
    createTime: {
      type: String,
      required: false,
    },
    note: {
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
