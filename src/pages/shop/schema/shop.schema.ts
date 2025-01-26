import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const ShopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: false,
    },
    users: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: 'Vendor',
          required: false,
        },
        username: {
          type: String,
          required: false,
        },
        role: {
          type: String,
          required: false,
        },
      },
    ],
    status: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    phoneNo: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
