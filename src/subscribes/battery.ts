import * as Sentry from '@sentry/node';

import { KickboardClient, PacketBattery } from 'kickboard-sdk';

import { BatteryModel } from '../models';
import logger from '../tools/logger';

export default async function onBatterySubscribe(
  kickboard: KickboardClient,
  packet: PacketBattery,
  done: () => void
): Promise<void> {
  logger.info(
    `[Subscribe] 배터리 - ${kickboard.kickboardId} 요청을 처리를 시작합니다.`
  );

  try {
    const options = { upsert: true };
    const where = { kickboardId: kickboard.kickboardId };
    const data = {
      kickboardId: kickboard.kickboardId,
      batterySN: packet.batterySN,
      totalTrip: packet.totalTrip,
      totalTime: packet.totalTime,
      totalCapacity: packet.totalCapacity,
      cellType: packet.cellType,
      cells: packet.cells,
      updatedAt: new Date(),
    };

    await BatteryModel.updateOne(where, data, options);
  } catch (err) {
    logger.error(
      `[Subscribe] 배터리 - ${kickboard.kickboardId}  구독을 저장하지 못했습니다.`
    );

    logger.error(`[Subscribe] ${err.stack}`);
    Sentry.captureException(err);
  } finally {
    done();
  }
}
