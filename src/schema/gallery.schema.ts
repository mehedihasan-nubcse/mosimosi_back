import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const GallerySchema = new mongoose.Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    folder: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
