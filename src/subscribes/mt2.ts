import * as Sentry from '@sentry/node';

import Dynamodb from '../tools/dynamodb';
import { KickboardClient } from 'kickboard-sdk';
import MT2Model from '../models/mt2';
import { PacketMT2 } from 'kickboard-sdk/dist/packets/mt2';
import logger from '../tools/logger';

export default async function onMT2Event(
  kickboard: KickboardClient,
  packet: PacketMT2,
  done: () => void
): Promise<void> {
  logger.debug(
    `[Subscribe] MT2 - ${kickboard.kickboardId} 요청을 처리를 시작합니다.`
  );

  try {
    const mt2 = new MT2Model();
    mt2.kickboardId = kickboard.kickboardId;
    mt2.timestamp = packet.timestamp.valueOf();
    mt2.messageNumber = packet.messageNumber;

    mt2.gpsTimestamp = packet.gps.timestamp.valueOf();
    mt2.gpsLatitude = packet.gps.latitude;
    mt2.gpsLongitude = packet.gps.longitude;
    mt2.gpsSatelliteUsedCount = packet.gps.satelliteUsedCount;
    mt2.gpsIsValid = packet.gps.isValid;
    mt2.gpsSpeed = packet.gps.speed;

    mt2.networkIsRoaming = packet.network.isRoaming;
    mt2.networkSignalStrength = packet.network.signalStrength;
    mt2.networkMCC = packet.network.mcc;
    mt2.networkMNC = packet.network.mnc;

    mt2.tripTime = packet.trip.time;
    mt2.tripDistance = packet.trip.distance;

    mt2.statusIsLightsOn = packet.status.isLightsOn;
    mt2.statusIsBuzzerOn = packet.status.isBuzzerOn;
    mt2.statusIsControllerChecked = packet.status.isControllerChecked;
    mt2.statusIsIotChecked = packet.status.isIotChecked;
    mt2.statusIsBatteryChecked = packet.status.isBatteryChecked;
    mt2.statusIsFailDown = packet.status.isFailDown;
    mt2.statusIsKickstandOn = packet.status.isKickstandOn;
    mt2.statusIsBatteryLocked = packet.status.isBatteryLocked;
    mt2.statusSpeed = packet.status.speed;

    mt2.vehicleIsEnabled = packet.vehicle.isEnabled;
    mt2.vehicleReportReason = packet.vehicle.reportReason;

    mt2.powerScooterBattery = packet.power.scooter.battery;
    mt2.powerScooterIsCharging = packet.power.scooter.isCharging;
    mt2.powerIotBattery = packet.power.iot.battery;
    mt2.powerIotIsCharging = packet.power.iot.isCharging;
    mt2.powerBatteryCycle = packet.power.batteryCycle;
    mt2.powerSpeedLimit = packet.power.speedLimit;

    await Dynamodb.mapper.put(mt2);
  } catch (err) {
    logger.error(`[Subscribe] MT2 - 구독을 저장하지 못했습니다.`);
    logger.error(`[Subscribe] ${err.stack}`);
    Sentry.captureException(err);
  } finally {
    done();
  }
}
