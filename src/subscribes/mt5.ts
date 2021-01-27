import * as Sentry from '@sentry/node';

import Dynamodb from '../tools/dynamodb';
import { KickboardClient } from 'kickboard-sdk';
import MT5Model from '../models/mt5';
import { PacketMT5 } from 'kickboard-sdk/dist/packets/mt5';
import logger from '../tools/logger';

export default async function onMT5Event(
  kickboard: KickboardClient,
  packet: PacketMT5,
  done: () => void
): Promise<void> {
  logger.info(
    `[Subscribe] MT5 - ${kickboard.kickboardId} 요청을 처리를 시작합니다.`
  );

  try {
    const mt5 = new MT5Model();
    mt5.kickboardId = kickboard.kickboardId;
    mt5.batterySN = packet.batterySN;
    mt5.totalTrip = packet.totalTrip;
    mt5.totalTime = packet.totalTime;
    mt5.totalCapacity = packet.totalCapacity;
    mt5.cellType = packet.cellType;
    mt5.cells = packet.cells;
    mt5.updatedAt = Date.now();

    await Dynamodb.mapper.put(mt5);
  } catch (err) {
    logger.error(`[Subscribe] MT5 - 구독을 저장하지 못했습니다.`);
    logger.error(`[Subscribe] ${err.stack}`);
    Sentry.captureException(err);
  } finally {
    done();
  }
}
