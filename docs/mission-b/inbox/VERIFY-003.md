# VERIFY-003 — CommitBar Disabled Reason Verification

Assignment: ASSIGNMENT-005 CommitBar Disabled Reason
Assigned Task: TASK-02 User Journey Squad
Status: Completed for this assignment

---

## 1. Files changed

```txt
src/features/product/components/quick-stock/CommitBar.jsx
docs/mission-b/inbox/VERIFY-003.md
```

Only one application source file was modified:

```txt
src/features/product/components/quick-stock/CommitBar.jsx
```

---

## 2. Summary of UX copy change

CommitBar now shows a short reason when Commit is unavailable.

Main added copy:

```txt
ยังรับสินค้าไม่ได้: ต้องสร้างสินค้าในร้านและกรอกราคาทุน/ราคาปลีกให้ครบก่อน
```

Other CommitBar-only disabled reasons:

```txt
ยังรับสินค้าไม่ได้: ยังไม่มีรายการใน Queue
ยังรับสินค้าไม่ได้: Queue ยังไม่ครบ
ยังรับสินค้าไม่ได้: ต้องสร้างสินค้าในร้านก่อน
ยังรับสินค้าไม่ได้: กรุณาตรวจสอบข้อมูลก่อน Commit
```

The wording supports the certified rule that Template is only a search/clone source and branch Operational Product is required before stock intake.

---

## 3. Confirmation only CommitBar was modified as application source

Confirmed.

Application source changed:

```txt
src/features/product/components/quick-stock/CommitBar.jsx
```

Application source not changed:

```txt
src/features/product/pages/QuickStockPage.jsx
src/features/product/components/quick-stock/ProductMasterPanel.jsx
src/features/product/components/quick-stock/ProductFinderPanel.jsx
src/features/product/store/productStore.js
src/features/product/api/productApi.js
```

No Backend files were changed.
No clone, create, or BranchPrice behavior was added.
No data contract was changed.

---

## 4. Template-only disabled reason verification

Static verification: PASS

- Commit remains unavailable unless `canCommit` is true.
- `canCommit` still requires selected product, Queue item count, product readiness, Queue readiness, and not committing.
- Disabled reason is shown only when Commit is unavailable and not currently committing.
- When product readiness is false, the user sees that intake cannot continue until a branch product exists and required prices are complete.
- The copy does not say Commit will create or clone a product.
- No new button or action was added.

---

## 5. Existing Operational Product commit regression verification

Static verification: PASS

- Commit button still uses the same `canCommit` safety condition.
- Commit button still calls `onCommit` unchanged.
- Reset Queue button still calls `onResetQueue` unchanged.
- Existing summary line remains visible.
- Existing Operational Product commit behavior remains unchanged from the CommitBar side.

---

## 6. Remaining UX debt

Remaining UX debt outside this assignment:

1. BarcodeScanner placeholder may still be generic for Template-only selection.
2. ProductFinderPanel search results still do not label Template candidates before selection.
3. Branch-created product flow remains missing.
4. Template-to-Operational clone/create flow remains missing.
5. BranchPrice first creation remains missing.
6. CommitBar cannot distinguish all upstream selection states because QuickStockPage props were out of scope.
7. Browser runtime verification in POS environment is still recommended.

---

## Completion status

ASSIGNMENT-005 completed within scope.

Exactly one application source file was modified, and this verification report was added.
