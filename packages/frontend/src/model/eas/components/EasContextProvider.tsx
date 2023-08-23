import {
  EAS,
  SchemaEncoder,
  SchemaItem,
  SchemaRegistry,
  SchemaValue,
} from '@ethereum-attestation-service/eas-sdk';
import {
  MetaTransactionData,
  OperationType,
  SafeTransactionDataPartial,
} from '@safe-global/safe-core-sdk-types';
import React, { ReactNode, useEffect, useState } from 'react';
import { useEasConfig } from '../hooks/useEasConfig';
import { useNetwork } from 'wagmi';
import { useSafe } from '../../safe/hooks/useSafe';
import { useProvider, useSigner } from '../../wagmi/hooks/useSigner';
import { EasContext } from '../types/eas-context-value.type';
import { SchemaField } from '../types/schema-field.type';
import { isSchemaFieldTypeName } from '../utils/is-schema-field-type-name';
import { parse } from 'csv-parse/sync';

export const ReactEasContext = React.createContext<EasContext | undefined>(
  undefined
);

type EasProviderProps = {
  schemaUid: string;
  children: ReactNode;
};

export const EasContextProvider: React.FC<EasProviderProps> = ({
  schemaUid,
  children,
}: EasProviderProps) => {
  // Hooks
  const { safeAddress, safe, safeApiKit, ethersAdapter } = useSafe();
  const { chain } = useNetwork();
  const easConfig = useEasConfig(chain?.id);
  const rpcProvider = useProvider();
  const rpcSigner = useSigner();

  // Local state
  const [state, setState] = useState<EasContext>({ schemaUid });

  function initEas() {
    if (!easConfig?.address) return;
    setState((previous) => ({ ...previous, eas: new EAS(easConfig.address) }));
  }

  function loadSchemaRecord() {
    if (!easConfig || !rpcProvider || !schemaUid) {
      return;
    }
    void (async () => {
      setState((prev) => ({
        ...prev,
        schemaRecordIsLoading: true,
        schemaRecordError: undefined,
      }));
      try {
        const schemaRegistry = new SchemaRegistry(easConfig.registryAddress);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schemaRegistry.connect(rpcProvider as any);
        if (!schemaUid) {
          return;
        }
        const schemaRecord = await schemaRegistry.getSchema({
          uid: schemaUid,
        });
        setState((prev) => ({
          ...prev,
          schemaRecord: schemaRecord,
          schemaRecordIsLoading: false,
        }));
      } catch (err) {
        console.error(err);
        setState((prev) => ({
          ...prev,
          schemaRecord: undefined,
          schemaRecordIsLoading: false,
          schemaRecordError: new Error('Error loading schema.'),
        }));
      }
    })();
  }

  function createSchemaFromRecord() {
    if (!state.schemaRecord) {
      return;
    }
    const schema: SchemaField[] = [];
    state.schemaRecord.schema.split(',').forEach((field) => {
      const [type, name] = field.split(' ');
      if (isSchemaFieldTypeName(type)) {
        schema.push({ name, type });
      } else {
        const err = new Error(`Invalid type name: ${type}`);
        console.error(err);
        setState((prev) => ({ ...prev, schemaError: err }));
      }
    });
    setState((prev) => ({
      ...prev,
      schema,
    }));
  }

  function initSchemaEncoder() {
    if (!state.schemaRecord?.schema) return;
    const schemaEncoder = new SchemaEncoder(state.schemaRecord?.schema);
    setState((prev) => ({ ...prev, schemaEncoder }));
  }

  const createAttestationsTransaction = async (csv: string): Promise<void> => {
    try {
      if (
        !rpcSigner ||
        !safeAddress ||
        !safe ||
        !safeApiKit ||
        !ethersAdapter ||
        !state.eas ||
        !state.schemaEncoder ||
        !state.schema
      ) {
        throw new Error('Missing signer, safe, safeApiKit or ethersAdapter');
      }

      setState((prev) => ({
        ...prev,
        safeTransactionState: {
          status: 'creating',
        },
      }));

      const safeTransactionData: MetaTransactionData[] = [];

      const parsedCsv: string[][] = parse(csv, {
        relax_column_count: true,
        relax_quotes: true,
        trim: true,
      });

      for (const row of parsedCsv) {
        // Skip optional header row
        // First value matches first schema column name = header row
        if (row[0] === state.schema[0].name) {
          continue;
        }

        // Skip empty rows
        if (row.length === 0 || (row.length === 1 && row[0] === '')) {
          continue;
        }

        // Skip rows with no recipient
        if (row[row.length - 1] === '') {
          continue;
        }

        // Check if the row has the correct number of columns
        if (row.length !== state.schema.length + 1) {
          throw new Error(
            `Invalid number of columns in row ${parsedCsv.indexOf(row) + 1}`
          );
        }

        // Encode the data
        const items: SchemaItem[] = [];
        for (let i = 0; i < state.schema.length; i++) {
          const { name, type } = state.schema[i];
          let value: SchemaValue;
          if (type.startsWith('uint')) {
            value = BigInt(row[i]);
          } else {
            switch (type) {
              case 'address':
                value = row[i];
                break;
              case 'string':
                value = row[i];
                break;
              case 'bool':
                value = row[i] === 'true';
                break;
              case 'bytes32':
                value = row[i];
                break;
              case 'bytes':
                value = row[i];
                break;
              default:
                value = row[i];
                break;
            }
          }

          items.push({
            name,
            value,
            type,
          });
        }

        const encodedData = state.schemaEncoder.encodeData(items);

        // Create the transaction data
        const txData: SafeTransactionDataPartial = {
          to: state.eas.contract.address,
          value: '0',
          data: state.eas.contract.interface.encodeFunctionData('attest', [
            {
              schema: schemaUid,
              data: {
                recipient: row[row.length - 1], // Last column should contain the recipient address
                expirationTime: 0,
                revocable: false,
                refUID:
                  '0x0000000000000000000000000000000000000000000000000000000000000000',
                data: encodedData,
                value: 0,
              },
            },
          ]),
          operation: OperationType.Call,
        };

        // Add the transaction data to the list
        safeTransactionData.push(txData);
      }

      const safeTransaction = await safe.createTransaction({
        safeTransactionData,
        options: {
          nonce: await safeApiKit.getNextNonce(safeAddress),
        },
      });

      const signerAddress = await rpcSigner.getAddress();
      const txHash = await safe.getTransactionHash(safeTransaction);

      setState((prev) => ({
        ...prev,
        safeTransactionState: {
          status: 'signing',
          txHash,
        },
      }));

      const signature = await safe.signTransactionHash(txHash);

      // Propose transaction to the service
      await safeApiKit.proposeTransaction({
        safeAddress,
        safeTransactionData: safeTransaction.data,
        safeTxHash: txHash,
        senderAddress: signerAddress,
        senderSignature: signature.data,
      });

      console.log('Proposed a transaction with Safe:', safeAddress);
      console.log('- Transaction hash:', txHash);
      console.log('- Signer address:', signerAddress);
      console.log('- Signature:', signature.data);

      setState((prev) => ({
        ...prev,
        safeTransactionState: {
          status: 'created',
          txHash,
          signature,
        },
      }));
    } catch (e) {
      setState((prev) => ({
        ...prev,
        safeTransactionState: {
          status: 'error',
          error: e as Error,
        },
      }));
      console.error('Error creating transaction', e);
    }
  };

  useEffect(initEas, [easConfig?.address]);
  useEffect(loadSchemaRecord, [easConfig, rpcProvider, schemaUid]);
  useEffect(createSchemaFromRecord, [state.schemaRecord]);
  useEffect(initSchemaEncoder, [state.schemaRecord?.schema]);

  const context = { ...state, createAttestationsTransaction };

  return (
    <ReactEasContext.Provider value={context}>
      {children}
    </ReactEasContext.Provider>
  );
};
