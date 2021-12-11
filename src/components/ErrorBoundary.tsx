import React, { ReactElement, ReactNode } from 'react';
import {
  ErrorBoundary as ReactErrorBoundary,
  FallbackProps,
} from 'react-error-boundary';

const ErrorFallback = ({ error }: FallbackProps): ReactElement => (
  <div className="container px-2 py-2 mx-auto italic text-red-700">
    <p className="text-center">{`You found a bug! 🥳 Please refresh`}</p>
    <pre className="text-xs text-left whitespace-pre-wrap">{`${error.message}\n ${error.stack}`}</pre>
  </div>
);

type Props = {
  children: ReactNode;
};

const ErrorBoundary = ({ children }: Props): ReactElement => (
  <ReactErrorBoundary FallbackComponent={ErrorFallback}>
    {children}
  </ReactErrorBoundary>
);

export default ErrorBoundary;
