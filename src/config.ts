/* eslint-disable no-console */
// This is restricted in GCP so is safe-ish to expose
export const RESTRICTED_API_KEY = 'AIzaSyBd3kPyYX2adZJK8y_Ml4fNHhWzFsc3VN0';

// `yarn dev` sets NODE_ENV to 'development'
// `yarn test` sets NODE_ENV to 'test'
// `yarn build` sets NODE_ENV to 'production'
export const IS_PROD_ENV = process.env.NODE_ENV === 'production';
// export const IS_PROD_ENV = true;
// export const IS_PROD_ENV = false;

export const IS_TEST_ENV = process.env.NODE_ENV === 'test';

// console.log('[config.ts] process.env.NODE_ENV', process.env.NODE_ENV, '\n');
// console.log('[config.ts] IS_PROD_ENV', IS_PROD_ENV, '\n');

export const reallyCallGoogleAPI = (): boolean => IS_PROD_ENV;
