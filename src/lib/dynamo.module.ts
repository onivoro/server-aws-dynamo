import { DynamicModule, Module } from '@nestjs/common';
import { moduleFactory } from '@onivoro/server-common';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ServerAwsDynamoConfig } from './classes/server-aws-dynamo-config.class';

@Module({})
export class DynamoModule {
  static configure(config: ServerAwsDynamoConfig): DynamicModule {
    return moduleFactory({
      module: DynamoModule,
      providers: [
        {
          provide: ServerAwsDynamoConfig,
          useValue: config
        },
        {
          provide: DocumentClient,
          useFactory: () => new DocumentClient({ region: config.AWS_REGION, credentials: { accessKeyId: config.AWS_ACCESS_KEY_ID, secretAccessKey: config.AWS_SECRET_ACCESS_KEY } })
        }
      ]
    });
  }
}
