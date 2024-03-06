import { PutItemOutput } from 'aws-sdk/clients/dynamodb';

export type PutItemCallback = (
  err: Error | undefined | null,
  data: PutItemOutput
) => void;
