# StockItem Module Architecture v2

## Mission

ยกระดับ `src/features/stockItem` ให้ใช้มาตรฐานเดียวกับ Barcode Module Architecture v2 โดยแยกความสามารถเป็น Vertical Slice ที่เป็นเจ้าของ API, service, projection, state/workflow และ public boundary ของตนเองอย่างชัดเจน พร้อมรักษาพฤติกรรมผู้ใช้และ API contract เดิมระหว่าง migration

## Stacked Authority

Increment นี้ต่อจาก Barcode Module Architecture v2 Cleanup:

- Base branch: `refactor/barcode-module-architecture-v2-cleanup`
- Base authority: `f4e7e08c0ae199678100c232b8a229e9f220aa3c`
- Barcode runtime evidence: 86 test files / 278 tests PASS, typecheck PASS, production build PASS

## Current Boundary Audit

### Current root API facade

`src/features/stockItem/api/stockItemApi.js` รวมหลายความรับผิดชอบไว้ในไฟล์เดียว:

- receive one scanned item
- receive all pending non-SN items
- search stock item
- mark stock items as sold
- list available stock items by product

ไฟล์นี้จึงเป็น broad facade ที่ผูก transport ของหลาย lifecycle/capability เข้าด้วยกัน

### Current root store

`src/features/stockItem/store/stockItemStore.js` รวม state และ orchestration หลายประเภท:

- scan-session state
- receive validation and duplicate prevention
- receive-one orchestration
- receive-all orchestration
- sold lifecycle mutation
- general stock search
- available-item query
- scan-list editing and undo

Store ปัจจุบันจึงทำหน้าที่ทั้ง workflow owner, error mapper, API consumer และ session state owner ในจุดเดียว

### Existing module-owned slice

มี StockItem receive slice เริ่มต้นแล้ว:

- `src/features/stockItem/receive/api/receiveStockItemApi.js`
- `src/features/stockItem/receive/services/receiveScannedStockItem.js`
- `src/features/stockItem/receive/projections/stockItemReceiveProjection.js`

Slice นี้เป็นฐานที่ถูกต้องสำหรับการย้าย receive ownership ออกจาก root facade/store

### Legacy presentation coupling

ยังมีหน้าและ component ที่ชื่อและ workflow ผูกกับ Barcode/Receipt scanning ภายใต้ StockItem:

- `src/features/stockItem/pages/ScanBarcodeListPage.jsx`
- `src/features/stockItem/pages/ListReceiptItemsToScanPage.jsx`
- `src/features/stockItem/components/PendingBarcodeTable.jsx`

ต้องตรวจ ownership ว่าเป็น StockItem receiving UI, Barcode scanning UI หรือ PurchaseOrderReceipt workflow ก่อนย้าย เพื่อไม่ย้ายตามชื่อโฟลเดอร์เพียงอย่างเดียว

## Target Capability Map

1. `receive/`
   - receive scanned item
   - receive pending non-SN items
   - receive session state and validation
2. `query/search/`
   - general barcode/SN search
3. `query/availability/`
   - available items by product
4. `lifecycle/sold/`
   - mark items sold
5. `movement/`
   - movement history and transfer-facing boundary when repository evidence exists
6. `adjustment/`
   - stock correction boundary when repository evidence exists
7. `reservation/`
   - availability/reservation interaction without absorbing Sales ownership
8. `audit/`
   - stock integrity and lifecycle evidence

Capabilities 5-8 are discovery targets only; no implementation will be invented without current runtime evidence.

## Increment Order

1. Current StockItem boundary and consumer audit
2. Establish module ownership/certification contracts
3. Complete Receive slice ownership and cut root facade/store dependency
4. Extract Search query slice
5. Extract Availability query slice
6. Extract Sold lifecycle slice
7. Normalize public entry points and cross-module imports
8. Retire proven-unused root facade/store compatibility
9. Full runtime certification

## Architecture Rules

- One capability owns its full frontend path: API transport → service/controller → projection → workflow/state → public boundary
- Cross-module consumers import only the target capability public boundary
- Barcode owns barcode identity, generation, print, scan and serial concerns; StockItem owns inventory item lifecycle and availability
- PurchaseOrderReceipt owns receipt finalization and receipt-document state
- Sales owns sale completion; StockItem may expose stock lifecycle commands but must not absorb sale orchestration
- Shared/common is limited to neutral infrastructure or primitives
- No compatibility file is removed without repository-wide consumer evidence

## Verification Gates

Every closed increment requires fresh evidence:

```text
npm run test:run
npm run typecheck
npm run build
```

Repository inspection alone is not Runtime PASS.

## Safety

- Draft working area
- No merge or production deployment without explicit approval
- No endpoint or user-facing behavior change unless separately approved
- Migration remains incremental and reversible
- Runtime authority must match the originating branch HEAD
