import * as Sentry from '@sentry/node';

import { KickboardClient, PacketStatus } from 'kickboard-sdk';

import { StatusModel } from '../models';
import logger from '../tools/logger';

export default async function onStatusSubscribe(
  kickboard: KickboardClient,
  packet: PacketStatus,
  done: () => void
): Promise<void> {
  logger.info(
    `[Subscribe] 상태 - ${kickboard.kickboardId} 요청을 처리를 시작합니다.`
  );

  try {
    const data = {
      kickboardId: kickboard.kickboardId,
      timestamp: packet.timestamp.toDate(),
      messageNumber: packet.messageNumber,
      gps: packet.gps,
      network: packet.network,
      trip: packet.trip,
      power: packet.power,
      isEnabled: packet.isEnabled,
      isLightsOn: packet.isLightsOn,
      isBuzzerOn: packet.isBuzzerOn,
      isControllerChecked: packet.isControllerChecked,
      isIotChecked: packet.isIotChecked,
      isBatteryChecked: packet.isBatteryChecked,
      isFailDown: packet.isFailDown,
      isEBSBrakeOn: packet.isEBSBrakeOn,
      isKickstandOn: packet.isKickstandOn,
      isLineLocked: packet.isLineLocked,
      isBatteryLocked: packet.isBatteryLocked,
      reportReason: packet.reportReason,
      speed: packet.speed,
    };

    await StatusModel.create(data);
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
