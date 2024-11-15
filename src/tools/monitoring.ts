import axios from 'axios';
import * as Sentry from '@sentry/node';
import { logger } from '@sentry/utils';

export async function reportMonitoringMetrics(
  monitorId: string,
  metricsData: any
): Promise<void> {
  try {
    await axios({
      method: 'POST',
      baseURL: String(process.env.HIKICK_CORESERVICE_MONITORING_URL),
      url: `/monitors/${monitorId}/metrics`,
      data: metricsData,
      headers: {
        Authorization: `bearer ${process.env.HIKICK_CORESERVICE_MONITORING_KEY}`,
      },
    });
  } catch (err: any) {
    Sentry.captureException(err);
    const metricsJson = JSON.stringify(metricsData);
    logger.error(
      `Monitoring / 모니터링 데이터를 전송할 수 없습니다. (${monitorId}, ${metricsJson})`
    );
  }
}
