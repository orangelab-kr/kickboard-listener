import * as Sentry from '@sentry/node';

import { InfoModel, KickboardMode, KickboardModel, logger } from '..';
import { KickboardClient, PacketInfo } from '@hikick/kickboard-sdk';

export default async function onInfoSubscribe(
  kickboard: KickboardClient,
  packet: PacketInfo,
  updatedAt: Date,
  done: () => void
): Promise<void> {
  const startTime = new Date();
  logger.debug(
    `Subscribe / 정보 - ${kickboard.kickboardId} 요청을 처리를 시작합니다.`
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
      updatedAt,
    };

    await InfoModel.updateOne(where, data, options);
    const time = Date.now() - startTime.getTime();
    logger.info(
      `Subscribe / 정보 - ${kickboard.kickboardId} 처리를 완료하였습니다. ${time}ms`
    );
  } catch (err: any) {
    logger.error(
      `Subscribe / 정보 - ${kickboard.kickboardId} 구독을 저장하지 못했습니다.`
    );

    logger.error(`Subscribe / ${err.stack}`);
    Sentry.captureException(err);
  } finally {
    done();
  }
}
