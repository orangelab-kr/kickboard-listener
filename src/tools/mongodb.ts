import logger from './logger';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';

export default class MongoDB {
  public static async init(): Promise<void> {
    const sslCA = [readFileSync('rds-combined-ca-bundle.pem')];
    const MONGODB_URI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/kickboard';
    const hasSSL = MONGODB_URI.includes('ssl=true');
    mongoose.Promise = global.Promise;
    await mongoose.connect(MONGODB_URI, {
      useCreateIndex: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      sslValidate: hasSSL ? false : undefined,
      sslCA: hasSSL ? sslCA : undefined,
    });

    logger.info(
      `[MongoDB] 데이터베이스 준비가 완료되었습니다. (보안: ${hasSSL})`
    );
  }
}
