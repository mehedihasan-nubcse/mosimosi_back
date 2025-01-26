import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const TransactionsSchema = new mongoose.Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    payableAmount: {
      type: Number,
      required: false,
    },
    paidAmount: {
      type: Number,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    vendor: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
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

    images: [String],

    date: {
      type: Date,
      required: false,
    },
    dateString: {
      type: String,
      required: false,
    },
  },

  {
    versionKey: false,
    timestamps: true,
  },
);
