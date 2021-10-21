import * as Sentry from '@sentry/node';
import dayjs from 'dayjs';
import { KickboardClient, PacketStatus } from 'kickboard-sdk';
import {
  InternalKickboardClient,
  InternalLocationClient,
  KickboardPermission,
  LocationPermission,
} from 'openapi-internal-sdk';
import {
  InternalClient,
  KickboardDoc,
  KickboardMode,
  KickboardModel,
  logger,
  reportMonitoringMetrics,
  StatusDoc,
  StatusModel,
} from '..';

let internalLocationClient: InternalLocationClient;
let internalKickboardClient: InternalKickboardClient;
const getLocation = (): InternalLocationClient => {
  if (internalLocationClient) return internalLocationClient;
  internalLocationClient = InternalClient.getLocation([
    LocationPermission.GEOFENCES_LOCATION,
  ]);

  return internalLocationClient;
};

const getKickboard = (): InternalKickboardClient => {
  if (internalKickboardClient) return internalKickboardClient;
  internalKickboardClient = InternalClient.getKickboard([
    KickboardPermission.KICKBOARD_METHOD_LATEST,
    KickboardPermission.KICKBOARD_LOOKUP_CONFIG,
    KickboardPermission.KICKBOARD_LOOKUP_DETAIL,
  ]);

  return internalKickboardClient;
};

export default async function onStatusSubscribe(
  kickboardClient: KickboardClient,
  packet: PacketStatus,
  createdAt: Date,
  done: () => void
): Promise<void> {
  const { kickboardId } = kickboardClient;
  try {
    const startTime = new Date();
    logger.debug(`Subscribe / 상태 - ${kickboardId} 요청을 처리를 시작합니다.`);
    const [beforeStatus, kickboardDoc] = await Promise.all([
      StatusModel.findOne({ kickboardId }).sort({ createdAt: -1 }),
      KickboardModel.findOne({ kickboardId }),
    ]);

    if (!kickboardDoc) {
      logger.warn(
        `Subscribe / 경고 - ${kickboardId} 등록되지 않은 킥보드입니다.`
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

    const status = await StatusModel.create(data);
    await Promise.all([
      KickboardModel.updateOne({ kickboardId }, { status: status._id }),
      isUnregistered(kickboardDoc),
      isUnauthorizedMovement(kickboardDoc, status),
      checkLocationGeofence({
        kickboardClient,
        kickboardDoc,
        packet,
        createdAt,
      }),
    ]);

    const time = Date.now() - startTime.getTime();
    logger.info(
      `Subscribe / 상태 - ${kickboardId} 처리를 완료하였습니다. ${time}ms`
    );
  } catch (err: any) {
    logger.error(
      `Subscribe / 상태 - ${kickboardId} 구독을 저장하지 못했습니다.`
    );

    if (process.env.NODE_ENV !== 'prod') {
      logger.error(err.name);
      logger.error(err.stack);
    }

    Sentry.captureException(err);
  } finally {
    done();
  }
}

async function checkLocationGeofence(props: {
  kickboardClient: KickboardClient;
  kickboardDoc: KickboardDoc;
  packet: PacketStatus;
  createdAt: Date;
}): Promise<void> {
  const { kickboardClient, kickboardDoc, packet, createdAt } = props;
  const { kickboardCode, kickboardId, maxSpeed } = kickboardDoc;
  if (
    process.env.NODE_ENV === 'prod' ||
    kickboardDoc.mode !== KickboardMode.INUSE ||
    dayjs(createdAt).add(1, 'minutes').isBefore(dayjs())
  ) {
    logger.debug(
      `Subscribe / 상태 - ${kickboardId} 속도 제한을 하지 않습니다. 1분 이전 데이터이거나, 이용 중이지 않거나 프로덕션 모드입니다.`
    );

    return;
  }

  try {
    const config = await getKickboard()
      .getKickboard(kickboardCode)
      .then((kickboard) => kickboard.getLatestConfig());

    const { latitude: lat, longitude: lng } = packet.gps;
    const geofence = await getLocation().getGeofenceByLocation({ lat, lng });
    const profile = await geofence.getProfile();
    const speed =
      profile.speed && maxSpeed
        ? profile.speed > maxSpeed
          ? maxSpeed
          : profile.speed
        : profile.speed && !maxSpeed
        ? profile.speed
        : !profile.speed && maxSpeed
        ? maxSpeed
        : 25;

    if (config.speedLimit === speed) return;
    logger.info(
      `Subscribe / 상태 - ${kickboardId} 속도가 변경되었습니다. (${geofence.name}, ${config.speedLimit}km/h -> ${speed}km/h)`
    );

    await kickboardClient.setSpeedLimit(speed || 25);
  } catch (err: any) {
    logger.error(
      `Subscribe / 상태 - ${kickboardId} 속도 제한을 할 수 없습니다.`
    );

    if (process.env.NODE_ENV !== 'prod') {
      logger.error(err.name);
      logger.error(err.stack);
    }

    Sentry.captureException(err);
  }
}

async function isUnregistered(kickboardDoc: KickboardDoc): Promise<void> {
  try {
    const { kickboardId, mode } = kickboardDoc;
    if (mode !== KickboardMode.UNREGISTERED) return;
    await KickboardModel.updateOne(
      { kickboardId },
      { mode: KickboardMode.READY }
    );

    logger.info(
      `Subscribe / 정보 - ${kickboardDoc.kickboardId} 신규 킥보드를 발견하였습니다.`
    );
  } catch (err: any) {
    logger.error(
      `Subscribe / 상태 - ${kickboardDoc.kickboardId} 신규 킥보드의 상태를 변경할 수 없습니다.`
    );

    if (process.env.NODE_ENV !== 'prod') {
      logger.error(err.name);
      logger.error(err.stack);
    }

    Sentry.captureException(err);
  }
}

async function isUnauthorizedMovement(
  kickboard: KickboardDoc,
  status: StatusDoc
): Promise<void> {
  if (!status.reportReason.includes(0)) return;
  await reportMonitoringMetrics('unauthorizedMovement', { kickboard, status });
  logger.info(
    `Subscribe / 정보 - ${kickboard.kickboardCode}에서 비정상적인 움직임이 발생하였습니다.`
  );
}
