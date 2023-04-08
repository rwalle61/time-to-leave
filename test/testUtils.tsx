import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import 'jest-extended';
// import { ThemeProvider } from "my-ui-lib"
// import { TranslationProvider } from "my-i18n-lib"
// import defaultStrings from "i18n/en-x-default"

const Providers = ({ children }: { children: React.ReactElement }) => children;
// return (
//   <ThemeProvider theme="light">
//     <TranslationProvider messages={defaultStrings}>
//       {children}
//     </TranslationProvider>
//   </ThemeProvider>
// )

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const customRender = (ui: any, options = {}): unknown =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  render(ui, { wrapper: Providers, ...options });

export * from '@testing-library/react';
export * from '@testing-library/user-event';
export { customRender as render };
