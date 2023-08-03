import { ethers } from 'ethers';

import { useSigner } from '../../../model/ethers/hooks/useSigner';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';
import {
  OperationType,
  SafeTransactionDataPartial,
} from '@safe-global/safe-core-sdk-types';
import { EAS } from '@ethereum-attestation-service/eas-sdk';
import { useRecoilValue } from 'recoil';
import { useParams } from 'react-router-dom';
import { PeriodPageParams, SinglePeriod } from '../../../model/periods/periods';
import { CreateAttestationsButton } from './CreateAttestationsButton';
import { CreateAttestationsDialog } from './CreateAttestationsDialog';
import { useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { AllReports } from '../../../model/report/reports';

const SAFE_ADDRESS = '0xf6937E015d5337F648fE01a03A74c9FAA4f90d54';
type UseAttestationsReturn = {
  createAttestation: () => Promise<void>;
};

function useAttestations(): UseAttestationsReturn {
  const signer = useSigner(10);
  const eas = new EAS('0x4200000000000000000000000000000000000021');
  console.log('eas', eas);

  const createAttestation = async (): Promise<void> => {
    try {
      console.log('createAttestation');
      console.log('signer', signer);
      if (!signer) {
        return;
      }

      // // Create EthAdapter instance
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer,
      });

      // // Create Safe instance
      const safe = await Safe.create({
        ethAdapter,
        safeAddress: SAFE_ADDRESS,
      });

      // Create Safe API Kit instance
      const safeService = new SafeApiKit({
        txServiceUrl: 'https://safe-transaction-optimism.safe.global',
        ethAdapter,
      });

      // Create transaction
      // const safeTransactionData: SafeTransactionDataPartial = {
      //   to: '0xa32aECda752cF4EF89956e83d60C04835d4FA867',
      //   value: '1', // 1 wei
      //   data: '0x',
      //   operation: OperationType.Call,
      // };

      // Create transaction
      const safeTransactionData: SafeTransactionDataPartial = {
        to: eas.contract.address,
        value: '0', // 1 wei
        data: eas.contract.interface.encodeFunctionData('attest', [
          {
            schema:
              '0x85500e806cf1e74844d51a20a6d893fe1ed6f6b0738b50e43d774827d08eca61',
            data: {
              recipient: '0xa32aECda752cF4EF89956e83d60C04835d4FA867',
              expirationTime: 0,
              revocable: false,
              refUID:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
              data: '0x0000000000000000000000000000000000000000000000000000000000000001',
              value: 0,
            },
          },
        ]),

        operation: OperationType.Call,
      };

      const safeTransaction = await safe.createTransaction({
        safeTransactionData,
      });

      const senderAddress = await signer.getAddress();
      const safeTxHash = await safe.getTransactionHash(safeTransaction);
      const signature = await safe.signTransactionHash(safeTxHash);

      // Propose transaction to the service
      await safeService.proposeTransaction({
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

      const tx = await safeService.getTransaction(safeTxHash);
      console.log('Transaction:', tx);
      console.log('Transaction2:', safeTransaction);

      const estimateTx = await safeService.estimateSafeTransaction(
        SAFE_ADDRESS,
        tx
      );
      console.log('estimateTx:', estimateTx);

      const executeTxResponse = await safe.executeTransaction(tx, {
        gasLimit: 1000000,
      });
      const receipt = await executeTxResponse.transactionResponse?.wait();

      console.log('Transaction executed:');
      console.log(
        `https://optimistic.etherscan.io/tx/${receipt?.transactionHash}`
      );
    } catch (e) {
      console.log('error', e);
    }
  };
  return { createAttestation };
}

const Attestations = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  const dialogRef = useRef(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (period?.status !== 'CLOSED') {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex flex-col items-center justify-center gap-5">
          <img
            src="/eas-logo.png"
            alt="Ethereum Attestation Service"
            className="block w-16"
          />
          Attestations can be generated once praise has been quantified and the
          period has been closed.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-5 px-5">
        <div className="flex justify-between">
          <h2>Attestations</h2>
          <img
            src="/eas-logo.png"
            alt="Ethereum Attestation Service"
            className="object-contain w-16"
          />
        </div>
        {period?.attestationsTxHash && (
          <div>No attestations have yet been created for this period.</div>
        )}
        <CreateAttestationsButton onClick={(): void => setDialogOpen(true)} />
      </div>
      <Dialog
        open={dialogOpen}
        onClose={(): void => setDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
        initialFocus={dialogRef}
      >
        <div ref={dialogRef}>
          <CreateAttestationsDialog
            onClose={(): void => setDialogOpen(false)}
          />
        </div>
      </Dialog>
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export default Attestations;
