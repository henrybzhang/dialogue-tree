import '@mantine/core/styles.css';
import '../styles/globals.css';
import React, { ReactNode } from 'react';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';

export const metadata = {
  title: 'Dialogue Tree',
  description: 'A tool for creating and editing dialogue trees',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
