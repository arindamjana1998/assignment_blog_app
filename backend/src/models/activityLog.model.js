import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    userName: {
      type: String,
      default: 'Unauthenticated / Guest',
      trim: true,
    },
    userEmail: {
      type: String,
      default: null,
      trim: true,
    },
    userRole: {
      type: String,
      default: 'guest',
      index: true,
    },
    method: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
      index: true,
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
    ip: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Optimize for fast chronological queries & filtering
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ event: 1, createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
