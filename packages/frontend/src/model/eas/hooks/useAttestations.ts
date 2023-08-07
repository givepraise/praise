import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import {
  MetaTransactionData,
  SafeTransactionDataPartial,
  OperationType,
  SafeSignature,
} from '@safe-global/safe-core-sdk-types';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ETH_CHAIN_ID } from '../../eth/eth.constants';
import { useSigner } from '../../eth/hooks/useSigner';
import { useReportRunReturn } from '../../report/types/use-report-run-return.type';
import { useSafe } from '../../safe/hooks/useSafe';
import {
  EAS_ADDRESS,
  ATTESTATION_SCHEMA,
  ATTESTATION_SCHEMA_UID,
} from '../eas.constants';
import { Attestation } from '../types/attestation.type';

const eas = new EAS(EAS_ADDRESS);
const schemaEncoder = new SchemaEncoder(ATTESTATION_SCHEMA);

type UseAttestationsReturn = {
  creating: boolean | undefined;
  txHash: string | undefined;
  signature: SafeSignature | undefined;
  createAttestationsTransaction: (
    data: useReportRunReturn,
    period: string
  ) => Promise<void>;
};

export function useAttestations(): UseAttestationsReturn {
  // Hooks
  const rpcSigner = useSigner(ETH_CHAIN_ID);
  const { safe, safeApiKit, ethersAdapter, SAFE_ADDRESS } = useSafe();

  // Local state
  const [creating, setCreating] = useState<boolean>();
  const [txHash, setTxHash] = useState<string>();
  const [signature, setSignature] = useState<SafeSignature>();

  const createAttestationsTransaction = async (
    data: useReportRunReturn,
    period: string
  ): Promise<void> => {
    try {
      if (
        !rpcSigner ||
        !safe ||
        !safeApiKit ||
        !ethersAdapter ||
        !SAFE_ADDRESS
      ) {
        throw new Error('Missing signer, safe, safeApiKit or ethersAdapter');
      }

      setCreating(true);

      const safeTransactionData: MetaTransactionData[] = [];
      const attestationRows = data.rows as unknown as Attestation[];

      for (const att of attestationRows) {
        // Only attest if the user has an identity
        if (!att.users_identityEthAddress) {
          continue;
        }

        // Encode the data
        const encodedData = schemaEncoder.encodeData([
          { name: 'period', value: period, type: 'string' },
          {
            name: 'received_score',
            value: att.total_received_praise_score,
            type: 'uint16',
          },
          {
            name: 'given_score',
            value: att.total_given_praise_score,
            type: 'uint16',
          },
          {
            name: 'top_10_receiver',
            value: att.top_10_receiver,
            type: 'bool',
          },
          {
            name: 'top_50_receiver',
            value: att.top_50_receiver,
            type: 'bool',
          },
          {
            name: 'top_100_receiver',
            value: att.top_100_receiver,
            type: 'bool',
          },
          {
            name: 'top_10_giver',
            value: att.top_10_giver,
            type: 'bool',
          },
          {
            name: 'top_50_giver',
            value: att.top_50_giver,
            type: 'bool',
          },
          {
            name: 'top_100_giver',
            value: att.top_100_giver,
            type: 'bool',
          },
        ]);

        // Create the transaction data
        const txData: SafeTransactionDataPartial = {
          to: eas.contract.address,
          value: '0',
          data: eas.contract.interface.encodeFunctionData('attest', [
            {
              schema: ATTESTATION_SCHEMA_UID,
              data: {
                recipient: att.users_identityEthAddress,
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
          nonce: await safeApiKit.getNextNonce(SAFE_ADDRESS),
        },
      });

      const signerAddress = await rpcSigner.getAddress();
      const txHash = await safe.getTransactionHash(safeTransaction);
      const signature = await safe.signTransactionHash(txHash);

      // Propose transaction to the service
      await safeApiKit.proposeTransaction({
        safeAddress: SAFE_ADDRESS,
        safeTransactionData: safeTransaction.data,
        safeTxHash: txHash,
        senderAddress: signerAddress,
        senderSignature: signature.data,
      });

      console.log('Proposed a transaction with Safe:', SAFE_ADDRESS);
      console.log('- Transaction hash:', txHash);
      console.log('- Signer address:', signerAddress);
      console.log('- Signature:', signature.data);

      setTxHash(txHash);
      setSignature(signature);
    } catch (e) {
      console.error('Error creating attestations', e);
      toast.error((e as Error).message);
    } finally {
      setCreating(false);
    }
  };
  return {
    creating,
    txHash,
    signature,
    createAttestationsTransaction,
  };
}
