import {
  attribute,
  hashKey,
  table,
} from '@aws/dynamodb-data-mapper-annotations';

@table('mt1')
export default class MT1Model {
  @hashKey()
  kickboardId!: string;

  @attribute()
  iccId!: string;

  @attribute()
  productId!: number;

  @attribute()
  macAddress!: string;

  @attribute()
  iotSoftwareVersion!: number;

  @attribute()
  iotHardwareVersion!: number;

  @attribute()
  ecuSoftwareVersion!: number;

  @attribute()
  ecuHardwareVersion!: number;

  @attribute()
  updatedAt!: number;
}
