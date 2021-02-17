import { Document, Schema, model } from 'mongoose';

export interface InfoDoc extends Document {
  kickboardId: string;
  batterySN: string;
  totalTrip: number;
  totalTime: number;
  totalCapacity: number;
  cellType: string;
  cells: number[];
  updatedAt: Date;
}

export const InfoVersionSchema = new Schema({
  hardware: { type: Number, required: false },
  software: { type: Number, required: false },
});

export const InfoSchema = new Schema(
  {
    kickboardId: { type: String, required: true, unique: true },
    iccId: { type: String, required: false },
    productId: { type: Number, required: false },
    macAddress: { type: String, required: false },
    iotVersion: { type: InfoVersionSchema, required: false },
    ecuVersion: { type: InfoVersionSchema, required: false },
  },
  { timestamps: true }
);

export const InfoModel = model<InfoDoc>('info', InfoSchema);
