import { IFindOneOptions } from './find-one-options.interface';

export interface IFindManyOptions<TDoc> extends IFindOneOptions<TDoc> {
  skip?: string;
  take?: number;
}
