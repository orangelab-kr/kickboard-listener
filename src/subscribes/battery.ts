import * as Sentry from '@sentry/node';

import { BatteryModel, logger } from '..';
import { KickboardClient, PacketBattery } from 'kickboard-sdk';

export default async function onBatterySubscribe(
  kickboard: KickboardClient,
  packet: PacketBattery,
  updatedAt: Date,
  done: () => void
): Promise<void> {
  const startTime = new Date();
  logger.debug(
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
      updatedAt,
    };

    await BatteryModel.updateOne(where, data, options);
    const time = Date.now() - startTime.getTime();
    logger.info(
      `[Subscribe] 배터리 - ${kickboard.kickboardId} 처리를 완료하였습니다. ${time}ms`
    );
  } catch (err) {
    logger.error(
      `[Subscribe] 배터리 - ${kickboard.kickboardId} 구독을 저장하지 못했습니다.`
    );

    logger.error(`[Subscribe] ${err.stack}`);
    Sentry.captureException(err);
  } finally {
    done();
  }
}
