import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');

describe('repair subcontract expense linkage', () => {
  it('requires an ExpensePayee instead of a free-text provider', () => {
    const panel = read('src/features/repair/components/RepairSubcontractPanel.jsx');
    expect(panel).toContain('sendForm.expensePayeeId');
    expect(panel).toContain('listExpensePayees');
    expect(panel).not.toContain('value={sendForm.providerName}');
  });

  it('shows accounting totals and keeps supplemental costs operational', () => {
    const panel = read('src/features/repair/components/RepairSubcontractPanel.jsx');
    expect(panel).toContain('relatedExpenses');
    expect(panel).toContain('transportCost');
    expect(panel).toContain('materialCost');
    expect(panel).toContain('otherOperationalCost');
  });

  it('lets accounting select a matching repair reason', () => {
    const form = read('src/features/taxExpense/components/TaxExpenseCreateForm.jsx');
    expect(form).toContain('repairSubcontractId');
    expect(form).toContain('repairJobId');
    expect(form).toContain('expensePayeeId');
  });
});
