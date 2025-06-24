import { Schema, model } from 'mongoose';

const ContactSchema = new Schema(
  {
    userId: {
      type: String,
      required: false,
    },
    providerId: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    location: {
      type: String,
      required: false,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ContactSchema.index({ email: 1 });
ContactSchema.index({ phone: 1 });

const Contact = model('Contact', ContactSchema);

export default Contact;
