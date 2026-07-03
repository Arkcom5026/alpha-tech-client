# UX-VALIDATION-PLAN-001 — Mission B Product Discovery Runtime

Mission: Mission B  
Assigned Role: FE-02 UX Owner  
Assignment: ASSIGNMENT-023  
Status: UX validation plan  
Implementation: NOT APPROVED — code changes forbidden

---

## 1. Context reviewed

Documents reviewed:

```txt
docs/mission-b/assignments/FE-02/ASSIGNMENT-023.md
docs/mission-b/inbox/ROLE-ARCH/DECISION-003.md
docs/mission-b/inbox/ROLE-ARCH/MISSION-AGENDA-REVISION-001.md
docs/mission-b/assignments/FE-01/ASSIGNMENT-022.md
docs/mission-b/inbox/FE-01/FLOW-INTEGRATION-001.md
```

Frontend files inspected for UX validation planning:

```txt
src/features/product/pages/QuickStockPage.jsx
src/features/product/components/quick-stock/ProductFinderPanel.jsx
```

Mission B is now Product Discovery Runtime:

```txt
Product Discovery
= Operational Product Search
+ Template Product Search
+ Local Product Creation
```

Approved validation paths:

```txt
Flow A — Template Product Path
Flow B — Existing Operational Product Path
Flow C — Local Product Create Path
```

---

## 2. UX checklist for Flow A — Template Product Path

Expected operator journey:

```txt
Search product
-> Template result appears
-> Operator understands it is Template / not yet branch product
-> Operator selects Template
-> UI resolves or creates Operational Product
-> Product becomes receive-ready
-> Operator scans barcode / serial
-> Operator commits receive
```

Checklist:

- Search result clearly labels Template candidate before selection.
- Template badge wording is short and field-friendly.
- Selecting a Template does not imply stock intake is ready.
- NOT CREATED state remains visible until an Operational Product exists.
- Template-to-Operational action wording is clear.
- Loading state while checking/creating Operational Product is visible enough to prevent repeated clicking.
- Error state explains whether branch product could not be found or could not be created.
- After successful create/adoption, UI clearly transitions to Operational Product state.
- Barcode scanner is unavailable until Operational Product exists.
- Commit remains unavailable until Operational Product, prices, and queue are ready.
- Operator can recover by changing product if the selected Template is wrong.

Validation PASS conditions:

```txt
Operator can explain: “This is a Template. I must create/use the branch product before receiving stock.”
```

Blocking UX risks for Flow A:

- Template result has no visible status label.
- UI allows scan/commit before Operational Product exists.
- Successful adoption does not visibly change the product state.
- Error message does not tell operator what to do next.

---

## 3. UX checklist for Flow B — Existing Operational Product Path

Expected operator journey:

```txt
Search product
-> Existing branch Operational Product appears
-> Operator selects Operational Product
-> Product detail/price is shown from branch product
-> Operator confirms required price readiness
-> Operator scans barcode / serial
-> Operator commits receive
```

Checklist:

- Existing Operational Product result is visually distinguishable from Template result when available.
- Existing Operational Product can be selected without opening local-create flow.
- Selected product summary is clear.
- ProductMasterPanel says the product is Operational Product of the branch.
- Branch price/cost fields are understandable and editable only for branch Operational Product.
- Required price fields are clear: costPrice and priceRetail.
- Receive section is enabled only when Operational Product exists.
- Queue state clearly indicates item count and readiness.
- Commit disabled reason is clear when price or queue is missing.
- Successful receive feedback is visible.

Validation PASS conditions:

```txt
Operator can search an existing branch product, select it, scan items, and understand why Commit is or is not available.
```

Blocking UX risks for Flow B:

- Existing branch product is not discoverable.
- Existing result looks identical to Template with no operator clue.
- Commit uses a product that is not visibly Operational Product.
- Required price readiness is unclear.

---

## 4. UX checklist for Flow C — Local Product Create Path

Expected operator journey:

```txt
Search product
-> No suitable Template or Operational Product found
-> Empty state offers Local Product creation
-> Operator fills minimum product fields
-> Operator fills required prices
-> Create Local Operational Product
-> UI adopts returned Operational Product
-> Operator receives stock through normal receive path
-> Later search finds the created Operational Product again
```

Checklist:

- Empty state appears only after an intentional search keyword/filter.
- Empty state wording explains when Local Product creation is appropriate.
- Local create entry point does not look like Template creation.
- Form fields are short, clear, and field-friendly.
- Required fields are visually or textually clear.
- Required product fields: name, productTypeId.
- Required price fields: costPrice, priceRetail.
- Optional fields are not presented as blockers.
- Submit button indicates Local Operational Product creation.
- Loading state prevents duplicate local-create submit.
- Error messages identify missing field or failed create.
- After success, operator sees Operational Product ready state.
- Barcode scanner and Commit become available only after adoption and price readiness.
- Operator can search again later and find the Local Operational Product as existing Operational Product.

Validation PASS conditions:

```txt
Operator can say: “No product was found, so I created a local product for this branch, then received stock into it.”
```

Blocking UX risks for Flow C:

- Empty state does not offer Local Product creation.
- Required fields are unclear.
- Local create can be submitted without costPrice or priceRetail.
- Successful create does not visibly adopt the Operational Product.
- Later search does not find the created product again.

---

## 5. Operator-facing labels / wording recommendations

Recommended field-friendly labels:

```txt
Search panel:
ค้นหาสินค้า
ผลการค้นหา
Template · ต้องสร้างในร้านก่อน
Operational Product ของร้าน
ยังไม่อยู่ในร้าน

Template flow:
สินค้านี้ยังเป็น Template
สร้างสินค้าในร้านก่อนรับเข้า
สร้าง Operational Product จาก Template
กำลังสร้างสินค้าในร้าน...

Local create flow:
สร้างสินค้า Local ของร้าน
ใช้เมื่อไม่มี Template ที่เหมาะสม
ชื่อสินค้า
ประเภทสินค้า
แบรนด์
หน่วย
ติดตาม Serial Number
ราคาทุน
ราคาขายปลีก
สร้างสินค้า Local และใช้รับเข้า
กำลังสร้างสินค้า Local...

Receive readiness:
พร้อมรับเข้า
ยังรับสินค้าไม่ได้
ต้องสร้างสินค้าในร้านก่อน
กรอกราคาทุน/ราคาปลีกให้ครบ
ยังไม่มีรายการใน Queue
Queue ยังไม่ครบ
```

Wording rules:

- Avoid saying Template is a product ready for stock intake.
- Avoid implying Commit creates or clones products.
- Use “สินค้าในร้าน” when explaining Operational Product to operators.
- Use “Local” only when needed to distinguish from Template and existing branch product.
- Keep error messages action-oriented.

---

## 6. Empty state requirements

Empty state should appear when:

```txt
Operator has searched or filtered intentionally
AND no matching results are visible
AND no Operational Product is currently adopted
```

Empty state must answer:

1. What happened?
2. What should the operator do next?
3. What will the next action create?

Recommended empty-state message:

```txt
ไม่พบสินค้าที่ตรงกับการค้นหา
ถ้าไม่มี Template ที่เหมาะสม ให้สร้างสินค้า Local ของร้านก่อนรับเข้า
```

Empty state must not:

- Trigger automatic product creation.
- Suggest Template Catalog mutation.
- Hide the search controls.
- Create stock rows.

---

## 7. Loading / error requirements

Loading requirements:

- Searching product should disable duplicate search actions or clearly indicate loading.
- Checking Operational Product from Template should show that the system is checking/creating branch product readiness.
- Creating Template-derived Operational Product should disable repeated submit.
- Creating Local Operational Product should disable repeated submit.
- Receiving stock should keep Commit disabled until completed or failed.

Error requirements:

- Search error: “ค้นหาสินค้าไม่สำเร็จ” plus retry path.
- Template create error: explain product is not yet created in branch.
- Local create validation error: name, productType, costPrice, and priceRetail must be specifically called out.
- Adoption error: explain created result is not ready as Operational Product.
- Receive error: explain receive was not completed and operator should retry or check queue.

Errors must not:

- Tell the operator that stock was received if create/adopt failed.
- Hide selected product state unexpectedly.
- Clear queue unless receive succeeds or operator explicitly resets.

---

## 8. Receive readiness criteria

Receive is UX-ready only when all conditions are visible or inferable:

```txt
Operational Product exists
costPrice > 0
priceRetail > 0
barcode queue has at least one row
queue rows have valid barcode
not searching / creating / committing
```

The UI should make these states understandable:

- Product readiness: branch product exists.
- Price readiness: required prices are complete.
- Queue readiness: scanned items are ready.
- Commit readiness: all above are satisfied.

Current plan accepts that some readiness reasons may be split across ProductMasterPanel, IntakeControlPanel, QueueSummary, and CommitBar, as long as the operator can understand the next required action.

---

## 9. Risks that should block UX validation

Block UX validation if any of these are found during manual/runtime testing:

1. Template-only product can be scanned or committed before Operational Product exists.
2. Local product creation succeeds but UI does not adopt the returned Operational Product.
3. Commit uses Template product id instead of Operational Product id.
4. Existing branch Operational Product cannot be discovered or selected.
5. Local create form allows submit without name, productTypeId, costPrice, or priceRetail.
6. Empty state does not provide Local Product creation entry point.
7. Loading state allows duplicate create/receive actions.
8. Error state misleads operator into thinking receive succeeded.
9. Search result labels make Template and Operational Product indistinguishable in practice.
10. Flow C local product cannot be found again through search after creation.

---

## 10. Risks that can be accepted as debt

Acceptable UX debt if documented:

1. Some labels still use mixed Thai/English terms such as Operational Product or Local.
2. Template badge only appears when status is present in returned result data.
3. Local create form is basic and not yet a polished reusable Product Form component.
4. Similar/duplicate product warning may be missing if backend does not provide candidate data yet.
5. Post-create feedback may be toast-based plus state transition rather than a dedicated success panel.
6. Browser/E2E verification may remain pending for VERIFY phase.
7. Advanced governance such as Template Promotion from Local Product remains out of scope.

---

## 11. PASS or NEEDS_DECISION conclusion

```txt
PASS WITH UX VALIDATION DEBT
```

Reason:

The current source and FE-01 report show a UX-validatable path for Flow C at source level, while Flow A and Flow B have enough visible states to define validation criteria. However, live E2E verification and branch/runtime data checks remain required before Mission B certification.

No ROLE-ARCH decision is required before FE-02 validation planning can proceed.

---

## 12. Next recommended owner

```txt
VERIFY
```

Recommended next action:

```txt
Run Mission B E2E verification against Flow A, Flow B, and Flow C using real branch/session data.
```

Verification should confirm:

```txt
Flow A: Template -> Operational Product -> Receive -> Branch Runtime
Flow B: Existing Operational Product -> Receive -> Branch Runtime
Flow C: Create Local -> Receive -> Search again -> Existing Operational Product -> Receive again
```
