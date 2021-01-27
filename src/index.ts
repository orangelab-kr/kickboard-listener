import * as Sentry from '@sentry/node';

import Dynamodb from './tools/dynamodb';
import { KickboardService } from 'kickboard-sdk';
import dotenv from 'dotenv';
import logger from './tools/logger';
import onMT1Event from './subscribes/mt1';
import onMT2Event from './subscribes/mt2';
import onMT5Event from './subscribes/mt5';

if (process.env.NODE_ENV === 'development') dotenv.config();

async function main() {
  try {
    logger.info('[Main] 시스템이 활성화되고 있습니다.');

    initSentry();
    await Dynamodb.init();

    const service = await connect();
    await registerSubscribe(service);

    logger.info('[Main] 시스템이 준비되었습니다.');
  } catch (err) {
    logger.error('[Service] 시스템을 활성화할 수 없습니다.');
    logger.error(`[Service] ${err.stack}`);
    Sentry.captureException(err);
    process.exit(1);
  }
}

async function connect(): Promise<KickboardService> {
  try {
    const service = new KickboardService({
      hostname: String(process.env.KICKBOARD_SERVICE_HOSTNAME),
      username: String(process.env.KICKBOARD_SERVICE_USERNAME),
      password: String(process.env.KICKBOARD_SERVICE_PASSWORD),
      vhost: String(process.env.KICKBOARD_SERVICE_VHOST),
    });

    await service.connect();
    logger.info('[Service] 성공적으로 킥보드 서비스와 연결되었습니다.');

    return service;
  } catch (err) {
    logger.error('[Service] 킥보드 서비스와 연결에 실패하였습니다.');
    throw Error('킥보드 서비스와 연결에 실패하였습니다.');
  }
}

async function registerSubscribe(service: KickboardService): Promise<void> {
  service.on('mt1', onMT1Event);
  logger.info('[Subscribe] MT1 이벤트 리스너가 활성화되었습니다.');

  service.on('mt2', onMT2Event);
  logger.info('[Subscribe] MT2 이벤트 리스너가 활성화되었습니다.');

  service.on('mt5', onMT5Event);
  logger.info('[Subscribe] MT5 이벤트 리스너가 활성화되었습니다.');

  await service.setSubscribe(process.env.KICKBOARD_SERVICE_QUEUE || 'updates');
  logger.info('[Subscribe] 구독 시스템이 활성화되었습니다.');
}

async function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });

  logger.info('[Sentry] 보고 시스템이 활성화되었습니다.');
}
main();
