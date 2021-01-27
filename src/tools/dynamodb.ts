import { CreateTableOptions, DataMapper } from '@aws/dynamodb-data-mapper';

import AWS from 'aws-sdk';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import MT1Model from '../models/mt1';
import MT2Model from '../models/mt2';
import MT5Model from '../models/mt5';
import logger from './logger';

export default class Dynamodb {
  public static client: DynamoDB;
  public static mapper: DataMapper;

  public static async init(): Promise<void> {
    AWS.config.update({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    this.client = new AWS.DynamoDB();
    this.mapper = new DataMapper({
      client: this.client,
      tableNamePrefix: `${process.env.NODE_ENV || 'prod'}-`,
    });

    await this.createTable();
    logger.info('[DynamoDB] 데이터베이스 준비가 완료되었습니다.');
  }

  public static async createTable(): Promise<void> {
    const options: CreateTableOptions = {
      readCapacityUnits: 1,
      writeCapacityUnits: 1,
    };

    await this.mapper.ensureTableExists(MT1Model, options);
    logger.info('[DynamoDB] MT1 데이터베이스 테이블이 준비되었습니다.');

    await this.mapper.ensureTableExists(MT2Model, options);
    logger.info('[DynamoDB] MT2 데이터베이스 테이블이 준비되었습니다.');

    await this.mapper.ensureTableExists(MT5Model, options);
    logger.info('[DynamoDB] MT5 데이터베이스 테이블이 준비되었습니다.');

    logger.info('[DynamoDB] 모든 데이터베이스 테이블이 준비되었습니다.');
  }
}
