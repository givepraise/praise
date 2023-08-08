// External package imports
import { useState, useEffect } from 'react';
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types';

// Internal imports
import { useAccount } from 'wagmi';
import { atom, atomFamily, useRecoilState } from 'recoil';
import { SignSafeTransactionStateType } from '../types/sign-safe-transaction-state.type';
import { useSafe } from './useSafe';
import { toast } from 'react-hot-toast';
import { errorHasReason } from '../../eth/util/errorHasReason';
import { errorHasMessage } from '../../eth/util/errorHasMessage';
import { ExecuteSafeTransactionStateType } from '../types/execute-safe-transaction-state.type';
import { SAFE_TX_SERVICE_URL } from '../safe.constants';

const SafeTransaction = atomFamily<SafeMultisigTransactionResponse, string>({
  key: 'SafeTransaction',
  default: undefined,
});

const SignSafeTransactionState = atom<SignSafeTransactionStateType>({
  key: 'SignSafeTransactionState',
  default: undefined,
});

const ExecuteSafeTransactionState = atom<ExecuteSafeTransactionStateType>({
  key: 'ExecuteSafeTransactionState',
  default: undefined,
});

type UseSafeTransactionProps = {
  safeTxHash?: string;
};

type UseSafeTransactionReturn = {
  transaction?: SafeMultisigTransactionResponse;
  moreConfirmationsRequired?: boolean;
  mySignatureAwaited?: boolean;
  signState?: SignSafeTransactionStateType;
  signTransaction?: () => void;
  executeState?: ExecuteSafeTransactionStateType;
  executeTransaction?: () => void;
};

/**
 * Custom hook to interface with Safe transactions.
 * @returns An object containing Safe transaction information and utilities.
 */
export function useSafeTransaction({
  safeTxHash,
}: UseSafeTransactionProps): UseSafeTransactionReturn {
  // Hooks
  const { address: userAddress } = useAccount();
  const { safe, safeApiKit } = useSafe();

  // Local state
  const [mySignatureAwaited, setMySignatureAwaited] = useState<boolean>();

  // Global state
  const [transaction, setTransaction] = useRecoilState(
    SafeTransaction(safeTxHash ?? '')
  );
  const [signState, setSignState] = useRecoilState(SignSafeTransactionState);
  const [executeState, setExecuteState] = useRecoilState(
    ExecuteSafeTransactionState
  );

  /**
   * Load the Safe transaction details.
   */
  function loadTransaction(): void {
    if (transaction || !safeApiKit || !safeTxHash) return;
    void (async (): Promise<void> => {
      const tx = await safeApiKit.getTransaction(safeTxHash);
      setTransaction(tx);
    })();
  }

  /**
   *  Check if the user's signature is required for the transaction.
   */
  function checkIfMySignatureAwaited(): void {
    if (!userAddress || !safe || !transaction) return;
    void (async (): Promise<void> => {
      const isOwner = await safe.isOwner(userAddress);
      setMySignatureAwaited(
        isOwner &&
          !transaction.confirmations?.find((c) => c.owner === userAddress)
      );
    })();
  }

  useEffect(loadTransaction, [
    safeApiKit,
    safeTxHash,
    transaction,
    setTransaction,
  ]);
  useEffect(checkIfMySignatureAwaited, [userAddress, safe, transaction]);

  const moreConfirmationsRequired =
    transaction?.confirmations &&
    transaction?.confirmationsRequired > 0 &&
    transaction.confirmations.length < transaction.confirmationsRequired;

  function signTransaction(): void {
    if (!safe || !safeTxHash || !safeApiKit) {
      return;
    }
    void (async (): Promise<void> => {
      setSignState({ state: 'signing' });
      try {
        const signature = await safe.signTransactionHash(safeTxHash);
        await safeApiKit.confirmTransaction(safeTxHash, signature.data);
        const tx = await safeApiKit.getTransaction(safeTxHash);
        setTransaction(tx);
        setSignState({ state: 'signed' });
      } catch (e) {
        if (errorHasReason(e) && e.reason) {
          toast.error(e.reason);
        } else if (errorHasMessage(e) && e.message) {
          toast.error(e.message);
        }
        setSignState({ state: 'error', error: e as Error });
      }
    })();
  }

  /**
   * Fetch the indexing status of the transaction every 10 seconds until it is indexed.
   */
  function awaitTransactionIndexing(): void {
    void (async (): Promise<void> => {
      const response = await fetch(
        `${SAFE_TX_SERVICE_URL}/api/v1/multisig-transactions/${transaction.safeTxHash}`
      );
      if (response.ok) {
        const tx = (await response.json()) as SafeMultisigTransactionResponse;
        if (tx.isExecuted) {
          setExecuteState({ state: 'executed' });
          setTimeout(() => {
            setTransaction(tx);
          }, 2000);
          return;
        }
        setTimeout(awaitTransactionIndexing, 10000);
      }
    })();
  }

  function executeTransaction(): void {
    if (!safe || !safeTxHash || !safeApiKit) {
      return;
    }
    void (async (): Promise<void> => {
      setExecuteState({ state: 'executing' });
      try {
        const txResponse = await safe.executeTransaction(transaction);
        await txResponse.transactionResponse?.wait();
        setExecuteState({ state: 'indexing' });
        setTimeout(awaitTransactionIndexing, 10000); // Check every 10 seconds if the transaction has been indexed
      } catch (e) {
        console.error('Unable to execute transaction', e);
        if (errorHasReason(e) && e.reason) {
          toast.error(e.reason);
        } else if (errorHasMessage(e) && e.message) {
          toast.error(e.message);
        }
        setExecuteState({ state: 'error', error: e as Error });
      }
    })();
  }

  return {
    transaction,
    moreConfirmationsRequired,
    mySignatureAwaited,
    signState,
    signTransaction,
    executeState,
    executeTransaction,
  };
}
