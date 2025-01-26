import * as mongoose from 'mongoose';
import { SPECIFICATION_SUB_SCHEMA } from './sub-schema.schema';
import { Schema } from 'mongoose';

export const PayoutSchema = new mongoose.Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    name: {
      type: String,
      required: false,
      trim: false,
    },
    image: {
      type: String,
      required: false,
    },
    mobileImage: {
      type: String,
      required: false,
    },
    payoutAmount: {
      type: [SPECIFICATION_SUB_SCHEMA],
      required: false,
    },
    title: {
      type: String,
      required: false,
    },
    amount: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
    priority: {
      type: Number,
      required: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
