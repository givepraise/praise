import {
  EAS,
  SchemaEncoder,
  SchemaRecord,
} from '@ethereum-attestation-service/eas-sdk';

import { SafeSignature } from '@safe-global/safe-core-sdk-types';
import { SchemaField } from './schema-field.type';

export type SafeTransactionState = {
  status:
    | 'creating'
    | 'signing'
    | 'created'
    | 'error'
    | 'executing'
    | 'executed';
  txHash?: string;
  signature?: SafeSignature;
  error?: Error;
};

export type EasContext = {
  schemaUid: string;
  eas?: EAS;
  schemaEncoder?: SchemaEncoder;
  schemaRecordIsLoading?: boolean;
  schemaRecord?: SchemaRecord;
  schemaRecordError?: Error;
  schema?: SchemaField[];
  schemaError?: Error;

  safeTransactionState?: SafeTransactionState;
  createAttestationsTransaction?: (csv: string) => Promise<void>;
};
