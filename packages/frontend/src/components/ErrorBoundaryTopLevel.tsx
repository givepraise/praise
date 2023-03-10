import ErrorPage from '@/pages/ErrorPage';
import { useErrorBoundary } from 'use-error-boundary';

/**
 *  ErrorBoundaryTopLevel is a wrapper around use-error-boundary's ErrorBoundary
 *  component. It is used to catch errors that occur at the top level of the app.
 */
export function ErrorBoundaryTopLevel({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  const { ErrorBoundary } = useErrorBoundary();

  return (
    <ErrorBoundary
      render={(): JSX.Element => children}
      renderError={({ error }): JSX.Element => <ErrorPage error={error} />}
    />
  );
}
