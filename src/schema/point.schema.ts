import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const PointSchema = new mongoose.Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    pointAmount: {
      type: Number,
      required: true,
    },
    pointValue: {
      type: Number,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
