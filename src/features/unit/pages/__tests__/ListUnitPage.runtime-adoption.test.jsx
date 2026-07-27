import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ListUnitPage from '../ListUnitPage';
import useUnitStore from '../../store/unitStore';
import { confirmation } from '@/runtime';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ shopSlug: 'alpha-tech' }),
}));

vi.mock('@/components/shared/buttons/StandardActionButtons', () => ({
  default: ({ onDelete }) => onDelete ? <button onClick={onDelete}>ลบ</button> : <button>เพิ่ม</button>,
}));

vi.mock('@/components/shared/dialogs/ConfirmDeleteDialog', () => ({
  default: ({ open, onConfirm, onCancel }) => open ? (
    <div>
      <button onClick={onCancel}>ยกเลิก</button>
      <button onClick={onConfirm}>ยืนยัน</button>
    </div>
  ) : null,
}));

describe('ListUnitPage ADS runtime adoption', () => {
  const fetchUnits = vi.fn();
  const deleteUnit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    confirmation.reset();
    useUnitStore.setState({
      units: [{ id: 1, name: 'ชิ้น' }],
      isLoading: false,
      error: null,
      fetchUnits,
      deleteUnit,
    });
  });

  it('cancels deletion without calling the store action', async () => {
    render(<ListUnitPage />);
    fireEvent.click(screen.getByRole('button', { name: 'ลบ' }));

    expect(confirmation.hasPending('unit.delete.1')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'ยกเลิก' }));

    await waitFor(() => expect(confirmation.hasPending('unit.delete.1')).toBe(false));
    expect(deleteUnit).not.toHaveBeenCalled();
  });

  it('calls deletion only after confirmation is accepted', async () => {
    deleteUnit.mockResolvedValueOnce(true);
    render(<ListUnitPage />);
    fireEvent.click(screen.getByRole('button', { name: 'ลบ' }));
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยัน' }));

    await waitFor(() => expect(deleteUnit).toHaveBeenCalledWith(1));
    expect(confirmation.hasPending('unit.delete.1')).toBe(false);
  });

  it('projects the ADS runtime error message', () => {
    useUnitStore.setState({ error: { message: 'ไม่สามารถลบหน่วยนับได้' } });
    render(<ListUnitPage />);

    expect(screen.getByText('ไม่สามารถลบหน่วยนับได้')).toBeInTheDocument();
    expect(screen.queryByText('[object Object]')).not.toBeInTheDocument();
  });
});
