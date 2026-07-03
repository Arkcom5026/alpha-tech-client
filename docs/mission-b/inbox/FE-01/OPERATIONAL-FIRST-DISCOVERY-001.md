# OPERATIONAL-FIRST-DISCOVERY-001 — Mission B Operational-first QuickStock Discovery

Mission: Mission B
Role: FE-01 Runtime Owner
Assignment: ASSIGNMENT-032
Status: PASS

## 1. PASS / NEEDS_DECISION

```txt
PASS
```

## 2. Files changed

Application source:

```txt
src/features/product/components/quick-stock/ProductFinderPanel.jsx
```

Report:

```txt
docs/mission-b/inbox/FE-01/OPERATIONAL-FIRST-DISCOVERY-001.md
```

No backend files were changed.
No QuickStock receive flow files were changed.
No Product Discovery API calls were changed.

## 3. Behavior implemented

QuickStock Product Finder is now Operational-first at the frontend presentation layer.

Implemented behavior:

```txt
If Operational Product and Template Product represent the same logical product,
show the Operational Product as the receive-ready option and hide the matching Template from primary choices.
```

Preserved behavior:

```txt
Operational-only result still shows Operational Product.
Template-only result still shows Template Product.
No-result case remains controlled by QuickStockPage and still allows Local Product create.
```

The Product Finder still groups results as:

```txt
สินค้าในร้าน / Operational Product
Template Catalog
```

But matching Template rows are removed from the Template Catalog group when an Operational Product already covers the same logical product.

## 4. Matching rule used

The matching rule is conservative and frontend-only.

Priority 1 — exact template linkage:

```txt
templateProductId
template_product_id
templateId
template_id
sourceTemplateProductId
source_template_product_id
```

For Template rows, the product's own id is also considered a template key when the row is detected as Template.

Priority 2 — conservative exact signature fallback:

```txt
normalized name + productTypeId + brandId
```

The fallback only applies when all three fields are available. This avoids hiding Templates aggressively when the match is uncertain.

## 5. Regression check

### Product Discovery API contract

```txt
PASS
```

No Product Discovery API call was changed.

Still unchanged:

```txt
QuickStockPage still performs Operational + Template search.
ProductFinderPanel still receives filteredProducts from parent.
ProductFinderPanel still calls onSelectProduct(discoveryKey).
Discovery key contract remains OPERATIONAL:<id> and TEMPLATE:<id>.
```

### Receive Flow

```txt
PASS
```

No receive endpoint or payload behavior was changed.

Still unchanged:

```txt
quickStockIntakeExistingAction remains the receive action.
Receive payload still uses productId: Number(operationalProduct.id).
```

### Verification cases

```txt
Operational + Template duplicate case: Operational remains visible; matching Template hidden from primary choices.
Template-only case: Template remains visible.
Operational-only case: Operational remains visible.
No-result case: unchanged; Local Product create remains controlled by QuickStockPage.
```

## 6. Remaining risks

```txt
Matching depends on frontend result shape.
Exact template linkage is safest when backend returns templateProductId or equivalent fields.
Fallback signature matching is intentionally conservative and may leave some duplicates visible if brand/type/name are incomplete.
```

This is acceptable for ASSIGNMENT-032 because the assignment explicitly required using the safest existing data and not hiding Templates aggressively when uncertain.

## 7. Next recommended owner

```txt
ROLE-ARCH
```

Recommended next decision:

```txt
Decide whether Mission B should proceed to E2E runtime verification, or assign BE-01 to strengthen backend response shape with reliable template linkage for all Operational Product search results.
```

## 8. Completion response fields

```txt
Report path: docs/mission-b/inbox/FE-01/OPERATIONAL-FIRST-DISCOVERY-001.md
PASS/NEEDS_DECISION: PASS
Files changed: src/features/product/components/quick-stock/ProductFinderPanel.jsx, docs/mission-b/inbox/FE-01/OPERATIONAL-FIRST-DISCOVERY-001.md
Behavior implemented: Operational-first QuickStock Product Finder; matching Template rows are hidden when a receive-ready Operational Product covers the same logical product.
Remaining risks: Matching depends on available frontend result shape; conservative fallback may leave uncertain duplicates visible.
Next recommended owner: ROLE-ARCH
```
