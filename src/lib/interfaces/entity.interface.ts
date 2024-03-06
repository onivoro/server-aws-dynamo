import { PutItemInput } from 'aws-sdk/clients/dynamodb';

export interface IEntity<TEntity> extends Pick<PutItemInput, 'TableName'> {
  Item: TEntity;
}
