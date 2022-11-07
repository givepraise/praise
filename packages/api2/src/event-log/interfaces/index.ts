export enum EventLogTypeKey {
  PERMISSION = 'PERMISSION',
  AUTHENTICATION = 'AUTHENTICATION',
  PERIOD = 'PERIOD',
  PRAISE = 'PRAISE',
  QUANTIFICATION = 'QUANTIFICATION',
  SETTING = 'SETTING',
}

export interface EventLogInput {
  type?: Types.ObjectId[];
  description?: Object;
}
