import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import {
  MetaTransactionData,
  SafeTransactionDataPartial,
  OperationType,
} from '@safe-global/safe-core-sdk-types';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilValue } from 'recoil';
import { CommunityByHostname } from '../../communitites/communities';
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

type UseAttestationsInput = {
  hostname: string;
};

type UseAttestationsReturn = {
  creating: boolean | undefined;
  createAttestations: (
    data: useReportRunReturn,
    period: string
  ) => Promise<void>;
  isOwnerValidSafeAddress: () => Promise<boolean>;
};

export function useAttestations({
  hostname,
}: UseAttestationsInput): UseAttestationsReturn {
  // Convert wagmi/viem `WalletClient` to ethers `Signer`, required by Safe
  const signer = useSigner(ETH_CHAIN_ID);

  // Load community details
  const community = useRecoilValue(CommunityByHostname(hostname));

  // Current requirement is that the community creator is the community Safe address
  const SAFE_ADDRESS = community?.creator || '';

  // Initialize Safe SDK
  const { safe, safeApiKit, ethersAdapter } = useSafe(SAFE_ADDRESS);

  const isOwnerValidSafeAddress = async (): Promise<boolean> => {
    if (!safeApiKit) {
      throw new Error('Missing safeApiKit');
    }
    const info = await safeApiKit.getSafeInfo(SAFE_ADDRESS);
    console.log('info', info);
    return true;
  };

  const [creating, setCreating] = useState<boolean | undefined>(undefined);

  const createAttestations = async (
    data: useReportRunReturn,
    period: string
  ): Promise<void> => {
    try {
      if (!signer || !safe || !safeApiKit || !ethersAdapter) {
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

      const senderAddress = await signer.getAddress();
      const safeTxHash = await safe.getTransactionHash(safeTransaction);
      const signature = await safe.signTransactionHash(safeTxHash);

      // Propose transaction to the service
      await safeApiKit.proposeTransaction({
        safeAddress: SAFE_ADDRESS,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress,
        senderSignature: signature.data,
      });

      console.log('Proposed a transaction with Safe:', SAFE_ADDRESS);
      console.log('- safeTxHash:', safeTxHash);
      console.log('- Sender:', senderAddress);
      console.log('- Sender signature:', signature.data);
    } catch (e) {
      console.error('Error creating attestations', e);
      toast.error((e as Error).message);
    } finally {
      setCreating(false);
    }
  };
  return { creating, createAttestations, isOwnerValidSafeAddress };
}
