import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const pagePath = 'src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx';
const page = read(pagePath);
const workspaceApi = read('src/features/sales/documents/workspace/api/saleDocumentWorkspaceApi.js');
const routes = read('src/routes/partner/salesRoutes.jsx');
const printShell = read('src/features/deliveryNote/print/workspace/components/DeliveryNotePrintShell.jsx');
const printPolicy = read('src/features/deliveryNote/print/workspace/policies/deliveryNotePrintPolicy.js');

describe('Delivery Note server authority cutover contract', () => {
  it('uses the shared document workspace boundary with the required command shape', () => {
    expect(page).toContain("from '@/features/sales/documents/workspace'");
    expect(page).toContain('loadSaleDocument({ saleId: sourceId })');
    expect(page).toContain('loadSaleDeliveryNoteAuthority({ saleId: sourceId })');
    expect(page).not.toContain('loadSaleDocument(saleId)');
    expect(workspaceApi).toContain('loadSaleDocument = async ({ saleId, paymentId } = {})');
    expect(workspaceApi).toContain('getSaleById');
  });

  it('uses route saleId as the normal sale document identity authority while allowing consolidated source routing', () => {
    expect(page).toContain('const { saleId, shopSlug } = useParams()');
    expect(page).toContain("const sourceId = searchParams.get('sourceId') || saleId");
    expect(page).toContain("const sourceType = String(searchParams.get('sourceType') || 'SALE').toUpperCase()");
    expect(routes).toContain("{ path: 'print/:saleId', element: <PrintDeliveryNotePage /> }");
  });

  it('does not use navigation state or legacy currentSale hydration authority', () => {
    expect(page).not.toContain('useLocation');
    expect(page).not.toContain('location.state');
    expect(page).not.toContain('navSale');
    expect(page).not.toContain('needHydrate');
    expect(page).not.toContain('getSaleByIdAction');
    expect(page).not.toContain('setCurrentSale(navSale)');
  });

  it('holds the server response as page-local document state', () => {
    expect(page).toContain('const [currentSale, setCurrentSale] = useState(null)');
    expect(page).toContain('setCurrentSale(sale || null)');
    expect(page).toContain('setCurrentSale(null)');
  });

  it('reloads from the server through the shared editor after mutation while respecting persisted revision authority', () => {
    expect(page).toContain('reload: loadCurrentDocument');
    expect(page).toContain('const persistedRevisionActive = !isConsolidated');
    expect(page).toContain('const legacyEditorEnabled = !isConsolidated && !preparation && !persistedRevisionActive;');
    expect(page).toContain('saleId: legacyEditorEnabled ? saleId : null');
    expect(page).toContain('useSaleDocumentLineEditor');
    expect(page).not.toContain('updateSaleDocumentLinesAction');
  });

  it('preserves the Delivery Note projection and renderer', () => {
    expect(page).toContain('preparedSaleItems');
    expect(page).toContain('buildDeliveryNoteBranchConfig');
    expect(printPolicy).toContain('buildDeliveryNoteBranchAddress');
    expect(page).toContain('<DeliveryNotePrintShell');
    expect(printShell).toContain('<DeliveryNoteForm');
    expect(page).toContain('hideDate={hideDate}');
    expect(page).toContain('saleItems={preparedSaleItems}');
  });
});
