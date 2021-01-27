import {
  attribute,
  hashKey,
  table,
} from '@aws/dynamodb-data-mapper-annotations';

@table('mt5')
export default class MT5Model {
  @hashKey()
  kickboardId!: string;

  @attribute()
  batterySN!: string;

  @attribute()
  totalTrip!: number;

  @attribute()
  totalTime!: number;

  @attribute()
  totalCapacity!: number;

  @attribute()
  cellType!: string;

  @attribute()
  cells!: number[];

  @attribute()
  updatedAt!: number;
}
