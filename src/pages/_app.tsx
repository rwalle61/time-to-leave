import { ThemeProvider, createTheme } from '@mui/material';
import type { AppProps } from 'next/app';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'tailwindcss/tailwind.css';
import AppHead from '../components/AppHead';
import ErrorBoundary from '../components/ErrorBoundary';
import Header from '../components/Header';
import { theme } from '../theme';

// eslint-disable-next-line react/function-component-definition, prefer-arrow/prefer-arrow-functions
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={createTheme(theme)}>
      <AppHead />
      <Header />
      <ErrorBoundary>
        <Component
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...pageProps}
        />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default MyApp;
