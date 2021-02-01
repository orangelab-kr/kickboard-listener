import { Document, Schema, model } from 'mongoose';
import {
  PacketConfigGprs,
  PacketConfigMqtt,
  PacketConfigReportInterval,
} from 'kickboard-sdk';

export interface IConfig extends Document {
  kickboardId: string;
  gprs: PacketConfigGprs;
  mqtt: PacketConfigMqtt;
  reportInterval: PacketConfigReportInterval;
  networks: string[];
  impact: number;
  bluetoothKey: string;
  speedLimit: number;
  networkMode: 'auto' | 'gsm' | 'wcdma' | 'lte' | 'td-scdma';
  updatedAt: Date;
}

export const ConfigGprsSchema = new Schema({
  apad: { type: String, required: false },
  username: { type: String, required: false },
  password: { type: String, required: false },
});

export const ConfigMqttSchema = new Schema({
  ipAddress: { type: String, required: false },
  port: { type: Number, required: false },
  clientId: { type: String, required: false },
  username: { type: String, required: false },
  password: { type: String, required: false },
});

export const ConfigReportIntervalSchema = new Schema({
  ping: { type: Number, required: false },
  trip: { type: Number, required: false },
  static: { type: Number, required: false },
});

export const ConfigSchema = new Schema({
  kickboardId: { type: String, required: true },
  gprs: { type: ConfigGprsSchema, required: false },
  mqtt: { type: ConfigMqttSchema, required: false },
  reportInterval: { type: ConfigReportIntervalSchema, required: false },
  networks: { type: [String], required: false },
  impact: { type: Number, required: false },
  bluetoothKey: { type: String, required: false },
  speedLimit: { type: Number, required: false },
  networkMode: { type: String, required: false },
  updatedAt: { type: Date, required: true, default: Date.now },
});

export const ConfigModel = model<IConfig>('config', ConfigSchema);
