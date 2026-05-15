import React from 'react';
import type { AppProps } from 'next/app';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProvider i18n={{ locale: 'pt-PT' }}>
      <Component {...pageProps} />
    </AppProvider>
  );
}
