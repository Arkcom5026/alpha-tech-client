import * as React from 'react';
import { Page, PageHeader, Stack } from '../../foundation.jsx';

const join = (...values) => values.filter(Boolean).join(' ');

/**
 * Generic CRUD page shell.
 *
 * This component owns layout only. Data fetching, permissions, routing,
 * validation, and business workflow remain inside the consuming feature.
 */
export function CrudPage({
  title,
  description,
  actions,
  notices,
  children,
  maxWidth = '6xl',
  gap = 4,
  className = '',
  contentClassName = '',
  ...props
}) {
  const maxWidths = {
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-none',
  };

  return (
    <Page className={className} {...props}>
      <div className={join('mx-auto w-full', maxWidths[maxWidth] || maxWidths['6xl'], contentClassName)}>
        <PageHeader title={title} description={description} actions={actions} />
        <Stack gap={gap}>
          {notices}
          {children}
        </Stack>
      </div>
    </Page>
  );
}
