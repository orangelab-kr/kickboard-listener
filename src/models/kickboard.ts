import { Document, Schema, model } from 'mongoose';

import { Status } from './status';

export interface Kickboard extends Document {
  kickboardId: string;
  status: Status;
  updatedAt: Date;
  createdAt: Date;
}

export enum KickboardMode {
  READY = 0,
  INUSE = 1,
  BROKEN = 2,
  COLLECTED = 3,
  UNREGISTERED = 4,
  DISABLED = 5,
}

export enum KickboardLost {
  FINAL = 0,
  THIRD = 1,
  SECOND = 2,
  FIRST = 3,
}

export enum KickboardCollect {
  BATTERY = 0,
  LOCATION = 1,
  BROKEN = 2,
  OTHER = 3,
}

export const KickboardSchema = new Schema({
  kickboardId: { type: String, required: true },
  mode: {
    type: Number,
    enum: KickboardMode,
    default: KickboardMode.UNREGISTERED,
    required: true,
  },
  lost: { type: Number, enum: KickboardLost, required: false },
  collect: { type: Number, enum: KickboardCollect, required: false },
  status: { type: Schema.Types.ObjectId, ref: 'status' },
  updatedAt: { type: Date, required: true, default: Date.now },
  createdAt: { type: Date, required: true, default: Date.now },
});

export const KickboardModel = model<Kickboard>('kickboard', KickboardSchema);
