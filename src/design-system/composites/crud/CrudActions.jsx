import * as React from 'react';
import { Button } from '../../foundation.jsx';

const join = (...values) => values.filter(Boolean).join(' ');

const actionVariant = {
  edit: 'secondary',
  secondary: 'secondary',
  destructive: 'danger',
  restore: 'primary',
  primary: 'primary',
};

export const CrudPrimaryAction = React.forwardRef(function CrudPrimaryAction(
  { className = '', ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      size="md"
      variant="primary"
      className={join('w-full sm:w-auto', className)}
      {...props}
    />
  );
});

export function CrudTableActions({ align = 'end', className = '', ...props }) {
  const alignment = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  };

  return (
    <div
      className={join(
        'flex flex-nowrap items-center gap-2 whitespace-nowrap',
        alignment[align] || alignment.end,
        className,
      )}
      {...props}
    />
  );
}

export const CrudTableAction = React.forwardRef(function CrudTableAction(
  { action = 'secondary', className = '', ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      size="sm"
      variant={actionVariant[action] || actionVariant.secondary}
      className={join('min-w-20 shrink-0 whitespace-nowrap', className)}
      {...props}
    />
  );
});