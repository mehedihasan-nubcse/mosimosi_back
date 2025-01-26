import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const AdminSchema = new mongoose.Schema(
  {
    readOnly: {
      type: Boolean,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      required: false,
    },
    profileImg: {
      type: String,
    },
    hasAccess: {
      type: Boolean,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    permissions: {
      type: [String],
      required: false,
    },
    registrationAt: {
      type: String,
      required: false,
    },
    lastLoggedIn: {
      type: Date,
      required: false,
    },

    shops: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: 'Shop',
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
        address: {
          type: String,
          required: false,
        },
        role: {
          type: String,
          required: false,
        },
        pages: {
          type: [String],
          required: false,
        },
        permissions: {
          type: [String],
          required: false,
        },
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
