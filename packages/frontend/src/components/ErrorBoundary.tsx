import { useErrorBoundary } from 'use-error-boundary';
import { ErrorPlaceholder } from '@/components/ErrorPlaceholder';

interface ErrorBoundaryProps {
  height: number;
  children: JSX.Element;
  onError?: JSX.Element;
}

export const ErrorBoundary = ({
  height,
  children,
  onError,
}: ErrorBoundaryProps): JSX.Element => {
  const { ErrorBoundary } = useErrorBoundary();

  return (
    <ErrorBoundary
      render={(): JSX.Element => children}
      renderError={(): JSX.Element =>
        onError || <ErrorPlaceholder height={height} />
      }
    />
  );
};
