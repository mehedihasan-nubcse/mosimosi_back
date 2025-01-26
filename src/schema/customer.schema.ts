import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const CustomerSchema = new mongoose.Schema(
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
      required: true,
    },
    userPoints: {
      type: Number,
      required: false,
      default: 0,
    },
    address: {
      type: String,
    },
    image: {
      type: String,
      required: false,
    },
    birthdate: {
      type: Date,
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
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
