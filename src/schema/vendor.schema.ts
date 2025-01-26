import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const VendorSchema = new mongoose.Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
      unique: false,
    },
    company: {
      type: String,
      required: false,
    },

    alternateNumber: {
      type: String,
      required: false,
    },
    address: {
      type: String,
    },
    image: {
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

    totalPaid: {
      type: Number,
      required: false,
      default: 0,
    },
    totalPayable: {
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
