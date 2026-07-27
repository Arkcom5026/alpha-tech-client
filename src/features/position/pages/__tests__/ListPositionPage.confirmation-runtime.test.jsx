import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { confirmation } from '@/runtime';
import ListPositionPage from '../ListPositionPage.jsx';
import { usePositionStore } from '../../stores/positionStore.js';

const fetchListAction = vi.fn();
const toggleActiveAction = vi.fn();

vi.mock('../../stores/positionStore.js', () => ({
  usePositionStore: vi.fn(),
}));

describe('ListPositionPage ADS confirmation adoption', () => {
  beforeEach(() => {
    confirmation.reset();
    fetchListAction.mockReset().mockResolvedValue({ items: [], meta: {} });
    toggleActiveAction.mockReset().mockResolvedValue({ id: 1, isActive: false });
    usePositionStore.mockReturnValue({
      list: [{ id: 1, name: 'ช่างเทคนิค', description: 'งานซ่อม', isActive: true }],
      meta: { page: 1, limit: 20, total: 1, pages: 1 },
      error: null,
      message: null,
      fetchListAction,
      toggleActiveAction,
    });
  });

  afterEach(() => cleanup());

  it('does not toggle when the confirmation is cancelled', async () => {
    render(<MemoryRouter><ListPositionPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'ปิดใช้งาน' }));
    expect(confirmation.hasPending('position.toggleActive.1')).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'ยกเลิก' }));

    await waitFor(() => {
      expect(toggleActiveAction).not.toHaveBeenCalled();
      expect(confirmation.hasPending('position.toggleActive.1')).toBe(false);
    });
  });

  it('toggles only after the confirmation is accepted', async () => {
    render(<MemoryRouter><ListPositionPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'ปิดใช้งาน' }));
    expect(toggleActiveAction).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'ยืนยัน' }));

    await waitFor(() => {
      expect(toggleActiveAction).toHaveBeenCalledWith(1);
      expect(confirmation.hasPending('position.toggleActive.1')).toBe(false);
    });
  });

  it('projects the ADS error message instead of the object string', () => {
    usePositionStore.mockReturnValue({
      list: [],
      meta: { page: 1, limit: 20, total: 0, pages: 1 },
      error: { message: 'ไม่สามารถโหลดตำแหน่งได้' },
      message: null,
      fetchListAction,
      toggleActiveAction,
    });

    render(<MemoryRouter><ListPositionPage /></MemoryRouter>);

    expect(screen.getByText('ไม่สามารถโหลดตำแหน่งได้')).toBeInTheDocument();
    expect(screen.queryByText('[object Object]')).not.toBeInTheDocument();
  });
});
