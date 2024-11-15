import { readFileSync } from 'fs';
import mongoose from 'mongoose';
import logger from './logger';

export default class MongoDB {
  public static async init(): Promise<void> {
    const sslCA = [readFileSync('rds-combined-ca-bundle.pem')];
    const MONGODB_URI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/kickboard';
    mongoose.Promise = global.Promise;
    await mongoose.connect(MONGODB_URI, {
      useCreateIndex: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      sslValidate: false,
      sslCA,
    });

    logger.info('[MongoDB] 데이터베이스 준비가 완료되었습니다.');
  }
}
