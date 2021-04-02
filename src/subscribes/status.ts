import * as Sentry from '@sentry/node';

import { KickboardClient, PacketStatus } from 'kickboard-sdk';
import {
  KickboardDoc,
  KickboardMode,
  KickboardModel,
  StatusModel,
} from '../models';
import { KickboardPermission, LocationPermission } from 'openapi-internal-sdk';

import InternalClient from '../tools/internalClient';
import logger from '../tools/logger';
import moment from 'moment';

const internalLocationClient = InternalClient.getLocation([
  LocationPermission.GEOFENCES_LOCATION,
]);

const internalKickboardClient = InternalClient.getKickboard([
  KickboardPermission.METHOD_LATEST,
  KickboardPermission.LOOKUP_CONFIG,
  KickboardPermission.LOOKUP_DETAIL,
]);

export default async function onStatusSubscribe(
  kickboardClient: KickboardClient,
  packet: PacketStatus,
  createdAt: Date,
  done: () => void
): Promise<void> {
  const { kickboardId } = kickboardClient;
  try {
    const startTime = new Date();
    logger.debug(`[Subscribe] 상태 - ${kickboardId} 요청을 처리를 시작합니다.`);
    const [beforeStatus, kickboardDoc] = await Promise.all([
      StatusModel.findOne({ kickboardId }).sort({ createdAt: -1 }),
      KickboardModel.findOne({ kickboardId }),
    ]);

    if (!kickboardDoc) {
      logger.warn(
        `[Subscribe] 경고 - ${kickboardId} 등록되지 않은 킥보드입니다.`
      );

      return;
    }

    const newLatitude = packet.gps.latitude;
    const newLongitude = packet.gps.longitude;
    const isValid = packet.gps.isValid;
    const lastLatitude = beforeStatus ? beforeStatus.gps.latitude : 0;
    const lastLongitude = beforeStatus ? beforeStatus.gps.longitude : 0;
    const lastUpdatedAt = beforeStatus
      ? beforeStatus.gps.updatedAt
      : new Date();

    const data = {
      kickboardId,
      timestamp: packet.timestamp.toDate(),
      messageNumber: packet.messageNumber,
      gps: {
        timestamp: packet.gps.timestamp,
        latitude: !isValid ? lastLatitude : newLatitude,
        longitude: !isValid ? lastLongitude : newLongitude,
        updatedAt: !isValid ? lastUpdatedAt : new Date(),
        satelliteUsedCount: packet.gps.satelliteUsedCount,
        isValid: packet.gps.isValid,
        speed: packet.gps.speed,
      },
      network: packet.network,
      trip: packet.trip,
      power: packet.power,
      isEnabled: packet.isEnabled,
      isLightsOn: packet.isLightsOn,
      isBuzzerOn: packet.isBuzzerOn,
      isControllerChecked: packet.isControllerChecked,
      isIotChecked: packet.isIotChecked,
      isBatteryChecked: packet.isBatteryChecked,
      isFallDown: packet.isFallDown,
      isEBSBrakeOn: packet.isEBSBrakeOn,
      isKickstandOn: packet.isKickstandOn,
      isLineLocked: packet.isLineLocked,
      isBatteryLocked: packet.isBatteryLocked,
      reportReason: packet.reportReason,
      speed: packet.speed,
      createdAt,
    };

    const { _id } = await StatusModel.create(data);
    await KickboardModel.updateOne({ kickboardId }, { status: _id });
    const time = Date.now() - startTime.getTime();
    await checkLocationGeofence(
      kickboardClient,
      kickboardDoc,
      packet,
      createdAt
    );

    logger.info(
      `[Subscribe] 상태 - ${kickboardId} 처리를 완료하였습니다. ${time}ms`
    );
  } catch (err) {
    logger.error(
      `[Subscribe] 상태 - ${kickboardId} 구독을 저장하지 못했습니다.`
    );

    if (process.env.NODE_ENV === 'dev') {
      logger.error(err.name);
      logger.error(err.stack);
    }

    Sentry.captureException(err);
  } finally {
    done();
  }
}

async function checkLocationGeofence(
  kickboardClient: KickboardClient,
  kickboardDoc: KickboardDoc,
  packet: PacketStatus,
  createdAt: Date
): Promise<void> {
  const { kickboardCode, kickboardId } = kickboardDoc;

  if (
    process.env.NODE_ENV === 'prod' ||
    kickboardDoc.mode !== KickboardMode.INUSE ||
    moment(createdAt).add(1, 'minutes').isBefore()
  ) {
    logger.debug(
      `[Subscribe] 상태 - ${kickboardId} 속도 제한을 하지 않습니다. 1분 이전 데이터이거나, 이용 중이지 않거나 프로덕션 모드입니다.`
    );

    return;
  }

  try {
    const config = await internalKickboardClient
      .getKickboard(kickboardCode)
      .then((kickboard) => kickboard.getLatestConfig());

    const { latitude: lat, longitude: lng } = packet.gps;
    const geofence = await internalLocationClient.getGeofenceByLocation({
      lat,
      lng,
    });

    const profile = await geofence.getProfile();
    const maxSpeed = profile.speed || 25;
    if (config.speedLimit === maxSpeed) return;
    logger.info(
      `[Subscribe] 상태 - ${kickboardId} ${geofence.name}으로 진입하여 속도를 변경합니다. (${config.speedLimit}km/h -> ${maxSpeed}km/h)`
    );

    await kickboardClient.setSpeedLimit(maxSpeed || 25);
  } catch (err) {
    logger.error(
      `[Subscribe] 상태 - ${kickboardId} 속도 제한을 할 수 없습니다.`
    );

    if (process.env.NODE_ENV === 'dev') {
      logger.error(err.name);
      logger.error(err.stack);
    }

    Sentry.captureException(err);
  }
}
