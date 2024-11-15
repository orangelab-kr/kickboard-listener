import * as Sentry from '@sentry/node';

import {
  onBatterySubscribe,
  onConfigSubscribe,
  onInfoSubscribe,
  onStatusSubscribe,
} from './subscribes';

import { KickboardService } from 'kickboard-sdk';
import MongoDB from './tools/mongodb';
import dotenv from 'dotenv';
import logger from './tools/logger';

if (process.env.NODE_ENV === 'dev') dotenv.config();

async function main() {
  try {
    logger.info('[Main] 시스템이 활성화되고 있습니다.');
    initSentry();
    await MongoDB.init();

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
  service.on('info', onInfoSubscribe);
  logger.info('[Subscribe] 정보 이벤트 리스너가 활성화되었습니다.');

  service.on('status', onStatusSubscribe);
  logger.info('[Subscribe] 상태 이벤트 리스너가 활성화되었습니다.');

  service.on('config', onConfigSubscribe);
  logger.info('[Subscribe] 설정 이벤트 리스너가 활성화되었습니다.');

  service.on('battery', onBatterySubscribe);
  logger.info('[Subscribe] 배터리 이벤트 리스너가 활성화되었습니다.');

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
