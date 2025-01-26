import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const UniqueIdSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      required: false,
    },
    invoiceNo: {
      type: Number,
      required: false,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: false,
    },
  },
  {
    versionKey: false,
    timestamps: false,
  },
);
