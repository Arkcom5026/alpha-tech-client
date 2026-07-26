import * as React from 'react';
import { Card, CardBody } from '../../foundation.jsx';

const join = (...values) => values.filter(Boolean).join(' ');

/**
 * Responsive toolbar container for generic search, filter, and action controls.
 * Consumers provide controls so the design system never owns business filters.
 */
export function CrudToolbar({
  children,
  actions,
  columns = 'search-filter',
  className = '',
  bodyClassName = '',
  ...props
}) {
  const columnLayouts = {
    single: 'grid-cols-1',
    'search-filter': 'grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px]',
    'search-filter-actions': 'grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px_auto]',
    auto: 'grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]',
  };

  return (
    <Card className={className} {...props}>
      <CardBody
        className={join(
          'grid items-end gap-3',
          columnLayouts[columns] || columnLayouts['search-filter'],
          bodyClassName,
        )}
      >
        {children}
        {actions ? <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div> : null}
      </CardBody>
    </Card>
  );
}
