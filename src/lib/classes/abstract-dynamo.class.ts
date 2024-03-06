import {
  DeleteItemInput,
  DocumentClient,
  QueryInput,
  ScanInput,
} from 'aws-sdk/clients/dynamodb';
import { Logger } from '@nestjs/common';
import { buildFilterExpression } from '../functions/build-filter-expression.function';
import { DynamoTableName } from 'aws-sdk/clients/iotevents';
import { IFindManyOptions } from '../interfaces/find-many-options.interface';

export abstract class AbstractDynamoRepository<TDoc> {
  abstract tableName: DynamoTableName;
  abstract tableKey: string;
  abstract ddb: DocumentClient;
  abstract logger: Logger;

  async delete(key: Partial<TDoc>) {
    const input: DeleteItemInput = {
      TableName: this.tableName,
      Key: key,
    };

    return await this.ddb.delete(input).promise();
  }

  async query(
    options?: IFindManyOptions<TDoc>,
    queryInputOverrides?: Partial<QueryInput>
  ) {
    const queryInput: QueryInput = this.createInputParams(options);

    const finalQueryInput: QueryInput = {
      ...queryInput,
      ...queryInputOverrides,
      ExpressionAttributeValues: {
        ...queryInput.ExpressionAttributeValues,
        ...queryInputOverrides.ExpressionAttributeValues,
      },
    };

    this.logger.debug(finalQueryInput);

    return await this.ddb.query(finalQueryInput).promise();
  }

  async getItemByKey(id: string) {
    const params = {
      TableName: this.tableName,
      Key: { [this.tableKey]: id },
    };

    const { Item } = await this.ddb.get(params).promise();

    return Item as TDoc;
  }

  async get(keyExpression: Partial<TDoc>) {
    this.logger.debug({ keyExpression, tableName: this.tableName });

    return (
      await this.ddb.get(this.tableName as any, keyExpression as any).promise()
    ).Item;
  }

  async batchGet(keys: []) {
    const params = {
      RequestItems: {
        [this.tableName]: {
          Keys: keys,
        },
      },
    };

    return await this.ddb.batchGet(params).promise();
  }

  async put(Item: TDoc) {
    return await this.ddb.put({ TableName: this.tableName, Item }).promise();
  }

  async scan(
    options?: IFindManyOptions<TDoc>,
    scanInputOverrides?: Partial<ScanInput>,
    pagingKeyExtractorFn?: (lastEvaluatedKey: TDoc) => any
  ) {
    this.logger.debug(this.tableName, { options, scanInputOverrides });

    const scanInput: ScanInput = this.createInputParams({
      ...options,
      TableName: this.tableName,
    } as any);

    const finalScanInput: DocumentClient.ScanInput = {
      ...scanInput,
      ...scanInputOverrides,
    };

    this.logger.debug(finalScanInput);

    const { Items, LastEvaluatedKey } = await this.ddb
      .scan(finalScanInput)
      .promise();

    return {
      data: Items as TDoc[],
      pagingKey: pagingKeyExtractorFn
        ? pagingKeyExtractorFn(LastEvaluatedKey as any)
        : LastEvaluatedKey,
    };
  }

  sortByDate(items: { createdAt: Date }[]) {
    if (items?.length) {
      items = items.sort(function (a, b) {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    }

    return items;
  }

  private createInputParams(options: IFindManyOptions<TDoc>) {
    const filterExpression = buildFilterExpression(options?.where);

    const input: any = { ...filterExpression, TableName: this.tableName };

    if (options?.skip) {
      input.ExclusiveStartKey = options?.skip as any;
    }

    if (options?.take || options?.take === 0) {
      input.Limit = options.take;
    }

    return input;
  }
}
