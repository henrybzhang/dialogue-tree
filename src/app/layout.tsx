import '@mantine/core/styles.css';
import '../styles/globals.css';
import React, { ReactNode } from 'react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { theme } from '@/src/styles/theme';

export const metadata = {
  title: 'Dialogue Tree',
  description: 'A tool for creating and editing dialogue trees',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        {/*<meta*/}
        {/*  name="viewport"*/}
        {/*  content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"*/}
        {/*/>*/}
      </head>
      <body>
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
