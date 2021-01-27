import {
  attribute,
  hashKey,
  rangeKey,
  table,
} from '@aws/dynamodb-data-mapper-annotations';

@table('mt2')
export default class MT2Model {
  @hashKey()
  kickboardId!: string;

  @rangeKey({ defaultProvider: () => Date.now() })
  createdAt!: number;

  @attribute()
  timestamp!: number;
  @attribute()
  messageNumber!: number;

  @attribute()
  gpsTimestamp!: number;
  @attribute()
  gpsLatitude!: number;
  @attribute()
  gpsLongitude!: number;
  @attribute()
  gpsSatelliteUsedCount!: number;
  @attribute()
  gpsIsValid!: boolean;
  @attribute()
  gpsSpeed!: number;

  @attribute()
  networkIsRoaming!: boolean;
  @attribute()
  networkSignalStrength!: number;
  @attribute()
  networkMCC!: number;
  @attribute()
  networkMNC!: number;

  @attribute()
  tripTime!: number;
  @attribute()
  tripDistance!: number;

  @attribute()
  statusIsLightsOn!: boolean;
  @attribute()
  statusIsBuzzerOn!: boolean;
  @attribute()
  statusIsControllerChecked!: boolean;
  @attribute()
  statusIsIotChecked!: boolean;
  @attribute()
  statusIsBatteryChecked!: boolean;
  @attribute()
  statusIsFailDown!: boolean;
  @attribute()
  statusIsEBSBrakeOn!: boolean;
  @attribute()
  statusIsKickstandOn!: boolean;
  @attribute()
  statusIsLineLocked!: boolean;
  @attribute()
  statusIsBatteryLocked!: boolean;
  @attribute()
  statusSpeed!: number;

  @attribute()
  vehicleIsEnabled!: boolean;
  @attribute()
  vehicleReportReason!: number[];

  @attribute()
  powerScooterBattery!: number;
  @attribute()
  powerScooterIsCharging!: boolean;
  @attribute()
  powerIotBattery!: number;
  @attribute()
  powerIotIsCharging!: boolean;
  @attribute()
  powerBatteryCycle!: number;
  @attribute()
  powerSpeedLimit!: number;
}
