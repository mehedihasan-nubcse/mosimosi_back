import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const RegistrationSchema = new mongoose.Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    offerId: {
      type: Schema.Types.ObjectId,
      ref: 'PromoOffer',
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
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
