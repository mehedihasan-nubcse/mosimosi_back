import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const ShopInformationSchema = new mongoose.Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    siteName: {
      type: String,
      required: false,
    },
    sellerName: {
      type: String,
      required: false,
    },
    payoutTitle: {
      type: String,
      required: false,
    },
    shortDescription: {
      type: String,
      required: false,
    },
    shopName: {
      type: String,
      required: false,
    },
    shopAddress: {
      type: String,
      required: false,
    },
    shopPhoneNo: {
      type: String,
      required: false,
    },
    siteLogo: {
      type: String,
      required: false,
    },
    navLogo: {
      type: String,
      required: false,
    },
    footerText: {
      type: String,
      required: false,
    },
    metaTitle: {
      type: String,
      required: false,
    },
    metaLogo: {
      type: String,
      required: false,
    },
    uenNo: {
      type: String,
      required: false,
    },
    shopNumber: {
      type: String,
      required: false,
    },
    footerLogo: {
      type: String,
      required: false,
    },
    othersLogo: {
      type: String,
      required: false,
    },
    addresses: [
      {
        type: Object,
        required: false,
      },
    ],
    emails: [
      {
        type: Object,
        required: false,
      },
    ],
    phones: [
      {
        type: Object,
        required: false,
      },
    ],
    downloadUrls: [
      {
        type: Object,
        required: false,
      },
    ],
    socialLinks: [
      {
        type: Object,
        required: false,
      },
    ],
    currency: {
      type: String,
      required: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
