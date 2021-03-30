import * as Sentry from '@sentry/node';

import { KickboardClient, PacketStatus } from 'kickboard-sdk';
import { KickboardModel, StatusModel } from '../models';

import logger from '../tools/logger';

export default async function onStatusSubscribe(
  kickboard: KickboardClient,
  packet: PacketStatus,
  done: () => void
): Promise<void> {
  const startTime = new Date();
  logger.debug(
    `[Subscribe] 상태 - ${kickboard.kickboardId} 요청을 처리를 시작합니다.`
  );

  try {
    const { kickboardId } = kickboard;
    const beforeStatus = await StatusModel.findOne({ kickboardId }).sort({
      createdAt: -1,
    });

    const newLatitude = packet.gps.latitude;
    const newLongitude = packet.gps.longitude;
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
        latitude: newLatitude !== 0 ? lastLatitude : newLatitude,
        longitude: newLongitude !== 0 ? lastLongitude : newLongitude,
        updatedAt: newLatitude !== 0 ? lastUpdatedAt : new Date(),
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
    };

    const { _id } = await StatusModel.create(data);
    await KickboardModel.updateOne({ kickboardId }, { status: _id });
    const time = Date.now() - startTime.getTime();
    logger.info(
      `[Subscribe] 상태 - ${kickboard.kickboardId} 처리를 완료하였습니다. ${time}ms`
    );
  } catch (err) {
    logger.error(
      `[Subscribe] 상태 - ${kickboard.kickboardId} 구독을 저장하지 못했습니다.`
    );

    logger.error(`[Subscribe] ${err.stack}`);
    Sentry.captureException(err);
  } finally {
    done();
  }
}
