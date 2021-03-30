import * as Sentry from '@sentry/node';

import { KickboardClient, PacketConfig } from 'kickboard-sdk';

import { ConfigModel } from '../models';
import logger from '../tools/logger';

export default async function onConfigSubscribe(
  kickboard: KickboardClient,
  packet: PacketConfig,
  done: () => void
): Promise<void> {
  const startTime = new Date();
  logger.debug(
    `[Subscribe] 설정 - ${kickboard.kickboardId} 요청을 처리를 시작합니다.`
  );

  try {
    const options = { upsert: true };
    const where = { kickboardId: kickboard.kickboardId };
    const data = {
      kickboardId: kickboard.kickboardId,
      gprs: packet.gprs,
      mqtt: packet.mqtt,
      reportInterval: packet.reportInterval,
      networks: packet.networks,
      impact: packet.impact,
      bluetoothKey: packet.bluetoothKey,
      speedLimit: packet.speedLimit,
      networkMode: packet.networkMode,
      updatedAt: new Date(),
    };

    await ConfigModel.updateOne(where, data, options);
    const time = Date.now() - startTime.getTime();
    logger.info(
      `[Subscribe] 설정 - ${kickboard.kickboardId} 처리를 완료하였습니다. ${time}ms`
    );
  } catch (err) {
    logger.error(
      `[Subscribe] 설정 - ${kickboard.kickboardId} 구독을 저장하지 못했습니다.`
    );

    logger.error(`[Subscribe] ${err.stack}`);
    Sentry.captureException(err);
  } finally {
    done();
  }
}
