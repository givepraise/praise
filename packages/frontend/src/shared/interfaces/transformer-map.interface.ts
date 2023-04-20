/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransformerMapOperateItem } from './transformer-map-operate-item.interface';

export interface TransformerMap {
  list?: string;
  item: any;
  remove?: string[];
  defaults?: any;
  operate: TransformerMapOperateItem[];
  each?: string;
}
