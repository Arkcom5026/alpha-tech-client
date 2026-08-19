import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const filePath = path.resolve('src/features/customerMoneyReceive/pages/CustomerMoneyReceiveDetailPage.jsx');
const source = fs.readFileSync(filePath, 'utf8');

describe('Customer Money Receive cancel partial-success authority', () => {
  it('keeps synchronous cancellation ownership and snapshots the destructive command', () => {
    expect(source).toContain('const cancellingRef = useRef(false);');
    expect(source).toContain('if (cancelling || cancellingRef.current || !id) return;');
    expect(source).toContain('const recordId = String(id);');
    expect(source).toContain('const reasonSnapshot = reason;');
    expect(source).toContain('const cancelRequestId = ++cancelRequestRef.current;');
    expect(source).toContain('const ownsCancelRequest = () => (');
    expect(source).toContain('await cancelCustomerMoneyReceive(recordId, reasonSnapshot);');
  });

  it('announces server-confirmed cancellation before refreshing the record', () => {
    const successIndex = source.indexOf("feedback.actionSuccess('ยกเลิกเอกสารรับเงินเรียบร้อยแล้ว'");
    const refreshIndex = source.indexOf('await loadRecord(recordId);');
    expect(successIndex).toBeGreaterThan(-1);
    expect(refreshIndex).toBeGreaterThan(successIndex);
  });

  it('separates refresh failure from cancellation failure', () => {
    expect(source).toContain('ยกเลิกเอกสารรับเงินสำเร็จแล้ว แต่โหลดสถานะเอกสารล่าสุดไม่สำเร็จ');
    expect(source).toContain('`customer-money-receive:cancel:${recordId}:refresh:error`');
    expect(source).toContain('`customer-money-receive:cancel:${recordId}:error`');
    expect(source).toContain('`customer-money-receive:cancel:${recordId}:context-changed:error`');
  });

  it('keeps a visible stale-state warning after partial success', () => {
    expect(source).toContain("const [refreshWarning, setRefreshWarning] = useState('');");
    expect(source).toContain('{refreshWarning && <div');
  });
});
