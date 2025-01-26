import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const RepairSchema = new mongoose.Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    date: {
      type: Date,
      required: false,
    },
    dateString: {
      type: String,
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
    nricNo: {
      type: String,
      required: false,
    },
    phoneNo: {
      type: String,
      required: false,
    },
    brand: {
      type: Object,
      required: false,
    },
    modelNo: {
      type: Object,
      required: false,
    },
    color: {
      type: Object,
      required: false,
    },
    status: {
      type: String,
      required: false,
    },
    deliveredDate: {
      type: String,
      required: false,
    },
    deliveredTime: {
      type: String,
      required: false,
    },
    imeiNo: {
      type: String,
      required: false,
    },
    problem: {
      type: Object,
      required: false,
    },
    purchase: {
      type: String,
      required: false,
    },
    condition: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    amount: {
      type: Number,
      required: false,
    },
    updateTime: {
      type: String,
      required: false,
    },
    repairFor: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },

    images: [String],
  },

  {
    versionKey: false,
    timestamps: true,
  },
);
