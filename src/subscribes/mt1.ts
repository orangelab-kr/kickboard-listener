import * as Sentry from '@sentry/node';

import Dynamodb from '../tools/dynamodb';
import { KickboardClient } from 'kickboard-sdk';
import MT1Model from '../models/mt1';
import { PacketMT1 } from 'kickboard-sdk/dist/packets/mt1';
import logger from '../tools/logger';

export default async function onMT1Event(
  kickboard: KickboardClient,
  packet: PacketMT1,
  done: () => void
): Promise<void> {
  logger.info(
    `[Subscribe] MT1 - ${kickboard.kickboardId} 요청을 처리를 시작합니다.`
  );

  try {
    const mt1 = new MT1Model();
    mt1.kickboardId = kickboard.kickboardId;
    mt1.iccId = packet.iccId;
    mt1.productId = packet.productId;
    mt1.macAddress = packet.macAddress;
    mt1.iotSoftwareVersion = packet.iotVersion.software;
    mt1.iotHardwareVersion = packet.iotVersion.hardware;
    mt1.ecuSoftwareVersion = packet.ecuVersion.software;
    mt1.ecuHardwareVersion = packet.ecuVersion.hardware;
    mt1.updatedAt = Date.now();

    await Dynamodb.mapper.put(mt1);
  } catch (err) {
    logger.error(`[Subscribe] MT1 - 구독을 저장하지 못했습니다.`);
    logger.error(`[Subscribe] ${err.stack}`);
    Sentry.captureException(err);
  } finally {
    done();
  }
}
