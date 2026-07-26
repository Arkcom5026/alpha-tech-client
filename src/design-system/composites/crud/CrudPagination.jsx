import * as React from 'react';
import { Button } from '../../foundation.jsx';

/**
 * Generic controlled pagination.
 * The consuming feature remains responsible for query state and data loading.
 */
export function CrudPagination({
  page = 1,
  totalPages = 1,
  onPageChange,
  siblingCount = 2,
  previousLabel = 'ก่อนหน้า',
  nextLabel = 'ถัดไป',
  disabled = false,
  summary,
  className = '',
}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeTotalPages = Math.max(1, Number(totalPages) || 1);

  if (safeTotalPages <= 1 && !summary) return null;

  const windowSize = siblingCount * 2 + 1;
  const start = Math.max(1, Math.min(safePage - siblingCount, safeTotalPages - windowSize + 1));
  const end = Math.min(safeTotalPages, start + windowSize - 1);
  const visiblePages = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  const changePage = (nextPage) => {
    if (disabled) return;

    const normalized = Math.min(safeTotalPages, Math.max(1, nextPage));
    if (normalized !== safePage) onPageChange?.(normalized);
  };

  return (
    <nav
      aria-label="การแบ่งหน้า"
      aria-disabled={disabled || undefined}
      className={`flex flex-wrap items-center justify-between gap-3 text-sm text-[hsl(var(--ads-text-muted))] ${className}`}
    >
      <span>{summary || `หน้า ${safePage} / ${safeTotalPages}`}</span>
      {safeTotalPages > 1 ? (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={disabled || safePage <= 1}
            onClick={() => changePage(safePage - 1)}
          >
            {previousLabel}
          </Button>
          {visiblePages.map((pageNumber) => (
            <Button
              key={pageNumber}
              size="sm"
              variant={pageNumber === safePage ? 'primary' : 'secondary'}
              aria-current={pageNumber === safePage ? 'page' : undefined}
              disabled={disabled}
              onClick={() => changePage(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
          <Button
            size="sm"
            variant="secondary"
            disabled={disabled || safePage >= safeTotalPages}
            onClick={() => changePage(safePage + 1)}
          >
            {nextLabel}
          </Button>
        </div>
      ) : null}
    </nav>
  );
}
