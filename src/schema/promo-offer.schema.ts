import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const PromoOfferSchema = new mongoose.Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
    terms: {
      type: String,
      required: false,
    },
    images: {
      type: [String],
      required: false,
    },
    startDateTime: {
      type: Date,
      required: false,
    },
    endDateTime: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
    totalSubmit: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
