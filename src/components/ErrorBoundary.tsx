import React, { ReactElement, ReactNode } from 'react';
import {
  ErrorBoundary as ReactErrorBoundary,
  FallbackProps,
} from 'react-error-boundary';

const ErrorFallback = ({ error }: FallbackProps): ReactElement => (
  <div className="container flex flex-col px-2 py-2 mx-auto italic text-red-700 align-middle space-y-2">
    <p className="text-center">You found a bug! 🥳</p>
    <button
      type="button"
      className="px-2 py-1 mx-auto text-xs text-white bg-purple-400 rounded-xl hover:bg-black hover:text-white hover:border-transparent"
      onClick={() => {
        window.location.reload();
      }}
    >
      Refresh
    </button>
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
