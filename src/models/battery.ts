import { Document, Schema, model } from 'mongoose';

export interface Battery extends Document {
  kickboardId: string;
  batterySN: string;
  totalTrip: number;
  totalTime: number;
  totalCapacity: number;
  cellType: string;
  cells: number[];
  updatedAt: Date;
}

export const BatterySchema = new Schema({
  kickboardId: { type: String, required: true },
  batterySN: { type: String, required: false },
  totalTrip: { type: Number, required: false },
  totalTime: { type: Number, required: false },
  totalCapacity: { type: Number, required: false },
  cellType: { type: String, required: false },
  cells: { type: [Number], required: false, default: [] },
  updatedAt: { type: Date, required: true, default: Date.now },
  createdAt: { type: Date, required: true, default: Date.now },
});

export const BatteryModel = model<Battery>('battery', BatterySchema);
