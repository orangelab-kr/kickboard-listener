import * as Sentry from '@sentry/node';

import { KickboardClient, PacketInfo } from 'kickboard-sdk';

import { InfoModel } from '../models';
import logger from '../tools/logger';

export default async function onInfoSubscribe(
  kickboard: KickboardClient,
  packet: PacketInfo,
  done: () => void
): Promise<void> {
  logger.info(
    `[Subscribe] 정보 - ${kickboard.kickboardId} 요청을 처리를 시작합니다.`
  );

  try {
    const options = { upsert: true };
    const where = { kickboardId: kickboard.kickboardId };
    const data = {
      kickboardId: kickboard.kickboardId,
      iccId: packet.iccId,
      productId: packet.productId,
      macAddress: packet.macAddress,
      iotVersion: packet.iotVersion,
      ecuVersion: packet.ecuVersion,
      updatedAt: new Date(),
    };

    await InfoModel.updateOne(where, data, options);
  } catch (err) {
    logger.error(
      `[Subscribe] 정보 - ${kickboard.kickboardId}  구독을 저장하지 못했습니다.`
    );

    logger.error(`[Subscribe] ${err.stack}`);
    Sentry.captureException(err);
  } finally {
    done();
  }
}
