# DEVELOPMENT-GAPS-001 — Mission B Frontend Runtime Development Gaps

Mission: Mission B
Role: FE-01 Runtime Owner
Assignment: ASSIGNMENT-028
Status: Discovery / Report Only
Implementation: LOCKED

## 0. Assignment source note

`docs/mission-b/assignments/FE-01/ASSIGNMENT-028.md` was requested but was not found on the current default branch during GitHub Connector lookup.

This report uses the user-provided Assignment objective as the controlling instruction:

```txt
ตรวจสอบ Frontend Runtime ทั้งหมดในขอบเขต Mission B แล้วรายงานเฉพาะ Development Gaps ที่ยังเหลือ
ไม่เสนอเรื่องเอกสารหรือการทดสอบที่ไม่ก่อให้เกิดความคืบหน้าของ Mission
```

No implementation files were modified for this assignment.

## 1. Files inspected

```txt
src/features/product/pages/QuickStockPage.jsx
src/features/product/components/quick-stock/ProductFinderPanel.jsx
src/features/product/api/productApi.js
src/features/product/store/productStore.js
```

Relevant previous FE-01 outputs also informed this gap review:

```txt
docs/mission-b/inbox/FE-01/FLOW-DESIGN-001.md
docs/mission-b/inbox/FE-01/FLOW-INTEGRATION-001.md
docs/mission-b/inbox/FE-01/PRODUCT-DISCOVERY-COMPLETION-001.md
```

## 2. Current FE runtime state

Mission B FE runtime currently has these foundations:

```txt
Template Product search path exists.
Operational Product search path exists.
Template -> Operational lookup/adopt path exists.
Template -> create Operational Product path exists.
Local create -> adopt path exists.
Receive path still uses /api/quick-stock/existing with operationalProduct.id.
Product store has explicit fetchOperationalProductsAction and fetchTemplateProductsAction split.
```

The remaining gaps are no longer about whether the paths exist. They are about lifecycle completeness, runtime ownership consistency, and closing all branch product surfaces around Operational Product as source of truth.

## 3. Product Runtime remaining gaps

### GAP-PRODUCT-01 — Local create is not yet store-owned

Current status:

```txt
QuickStockPage imports createLocalOperationalProductApi directly.
productStore imports createOperationalProductFromTemplateApi but not createLocalOperationalProductApi.
```

Why this matters:

```txt
Template create has a store action, while local create bypasses productStore.
QuickStockPage owns local-create loading/error/adoption directly.
This creates uneven runtime ownership between Template create and Local create.
```

Recommended owner:

```txt
FE-01
```

Recommended development action:

```txt
Add createLocalOperationalProductAction(payload) to productStore and have QuickStockPage call the store action.
```

Priority:

```txt
P1 — should be done before Mission B closure because Local Operational Product lifecycle is part of Mission B scope.
```

### GAP-PRODUCT-02 — Product edit/update from QuickStock is not fully lifecycle-safe

Current status:

```txt
QuickStockPage inline edit can update name/productTypeId/brandId/unitId/trackSerialNumber/active/branchPrice.
```

Development concern:

```txt
Fields like productTypeId, mode/noSN, and trackSerialNumber can change stock behavior and runtime identity.
QuickStockPage currently preserves mode/noSN more safely than earlier versions, but the UI still exposes fields that may require backend-certified transition rules.
```

Recommended owner:

```txt
FE-01 + BE-01
```

Recommended development action:

```txt
FE-01: lock or narrow QuickStock inline editable fields to safe operational fields.
BE-01: certify which product fields are safe to patch after stock exists.
```

Priority:

```txt
P2 — important for stability, but not necessarily blocking initial Mission B close if QuickStock edit is treated as recovery/admin helper.
```

### GAP-PRODUCT-03 — Product runtime response normalization is duplicated in page-level code

Current status:

```txt
QuickStockPage has local normalizeTemplateProduct, normalizeOperationalProduct, extractProductList, extractSingleProduct, adoption validation, and discovery source tagging.
productStore also has normalizePosProductList and operational/template fetch actions.
```

Why this matters:

```txt
Runtime normalization now lives in multiple places.
Future Product List/Product Detail/Search surfaces can drift from QuickStock behavior.
```

Recommended owner:

```txt
FE-01
```

Recommended development action:

```txt
Move Product Runtime normalization helpers to productStore or a shared productRuntimeNormalizer module after Mission B critical path is stable.
```

Priority:

```txt
P3 — not blocking Mission close, but should be cleaned before broad product runtime expansion.
```

## 4. QuickStock Runtime remaining gaps

### GAP-QS-01 — Product discovery has source coverage but not yet a hardened UX grouping model

Current status:

```txt
ProductFinderPanel can show Operational and Template badges.
Operational results are prioritized before Template results.
```

Remaining development gap:

```txt
Results are still one flat list, not grouped into clear sections:
- สินค้าในร้านแล้ว
- Template Catalog
```

Why this matters:

```txt
Flat mixed results are usable but can still confuse operators when the same product appears as both Operational and Template.
```

Recommended owner:

```txt
FE-01
```

Recommended development action:

```txt
Group ProductFinderPanel results by discovery source while preserving existing selection contract.
```

Priority:

```txt
P2 — improves field safety but not blocking if badges are clear enough.
```

### GAP-QS-02 — Local-create form is embedded in QuickStockPage, not a dedicated runtime component

Current status:

```txt
Local create form lives directly in QuickStockPage.
```

Why this matters:

```txt
QuickStockPage is already a large runtime orchestrator.
Local Product lifecycle will likely grow, including duplicate detection, branch price preview, unit defaults, and ProductType/Brand filtering.
```

Recommended owner:

```txt
FE-01
```

Recommended development action:

```txt
Extract LocalCreateOperationalProductPanel only after the current Mission B runtime path is stable.
```

Priority:

```txt
P3 — not required before Mission B closure unless local-create UI starts causing defects.
```

### GAP-QS-03 — QuickStock receive readiness depends on price fields but does not clearly distinguish create price vs receive price

Current status:

```txt
Local create requires costPrice and priceRetail.
Receive also requires costPrice/defaultCost and priceRetail.
```

Development concern:

```txt
Operators may interpret local-create price as product creation price, but receive will also use priceForm/defaultCost as runtime BranchPrice source.
The two steps need clearer runtime semantics.
```

Recommended owner:

```txt
FE-01
```

Recommended development action:

```txt
Clarify labels and state transition after local-create/template-create so receive price fields are visibly the active BranchPrice/receive source.
```

Priority:

```txt
P2 — prevents price mistakes during real operation.
```

### GAP-QS-04 — QuickStock still contains legacy all-in-one/enroll actions that are not canonical Mission B path

Current status:

```txt
productStore still exposes quickStockInAllInOneAction and enrollQuickStockAction.
QuickStockPage currently uses quickStockIntakeExistingAction for canonical receive.
```

Development concern:

```txt
Legacy actions increase risk of future accidental re-entry into non-canonical product creation/stock flow.
```

Recommended owner:

```txt
FE-01 + ROLE-ARCH
```

Recommended development action:

```txt
Mark legacy actions as non-canonical or isolate them from Mission B QuickStock route usage.
```

Priority:

```txt
P3 — not blocking if QuickStockPage continues to use /quick-stock/existing only.
```

## 5. Product List / Product Detail / Search Runtime remaining gaps

### GAP-LIST-01 — Product List must be certified to use Operational Product only

Current status:

```txt
productStore has fetchOperationalProductsAction -> getProductsForPos.
fetchProductsAction defaults to operational search unless template=true.
```

Remaining development gap:

```txt
The actual Product List page/surface still needs to be checked or patched to ensure it calls fetchOperationalProductsAction or fetchProductsAction without template=true, and never displays Template Product as store runtime product.
```

Recommended owner:

```txt
FE-01
```

Recommended development action:

```txt
Inspect and, if needed, patch Product List runtime to use Operational Product source only.
```

Priority:

```txt
P1 — required before Mission B can be considered closed, because product visibility after QuickStock receive is a Mission B endpoint.
```

### GAP-LIST-02 — Product Detail must be certified to open Operational Product detail only

Current status:

```txt
productApi.getProductById calls GET products/:id?v=full.
Backend route alias is expected to be branch scoped, but FE detail flow must ensure it passes Operational Product id only.
```

Remaining development gap:

```txt
Product Detail page/surface needs to be checked so Template Product ids from search/discovery cannot open as branch Product Detail.
```

Recommended owner:

```txt
FE-01
```

Recommended development action:

```txt
Inspect Product Detail page and route entry points; gate detail open to Operational Product ids or redirect Template ids through create/adopt flow.
```

Priority:

```txt
P1 — Product Detail is part of operational runtime and must not display Template data.
```

### GAP-SEARCH-01 — Search runtime has mixed `search` vs `searchText` parameter handling

Current status:

```txt
getProductsForPos forwards sanitized filters.
productStore.fetchOperationalProductsAction sets searchText from search/searchText.
QuickStockPage sends both search and searchText to getProductsForPos.
Template search uses search.
```

Development concern:

```txt
FE has adapted to backend variance by sending both parameters in QuickStockPage.
Other Product Search surfaces may not do the same, creating inconsistent search behavior.
```

Recommended owner:

```txt
FE-01 + BE-01 if backend contract needs cleanup
```

Recommended development action:

```txt
FE-01: normalize one frontend search param adapter for operational search.
BE-01: confirm canonical query field for /products/pos/search.
```

Priority:

```txt
P2 — can affect discoverability but QuickStock currently mitigates by sending both.
```

## 6. Local Operational Product Lifecycle remaining gaps

### GAP-LOCAL-01 — Local product create response is adopted but not globally refreshed across product runtime surfaces

Current status:

```txt
After create-local, QuickStockPage prepends the adopted product to its local runtimeSearchProducts.
```

Remaining gap:

```txt
Other product runtime surfaces do not automatically know about the new product until their own fetch refreshes.
```

Recommended owner:

```txt
FE-01
```

Recommended development action:

```txt
On local-create success, store-owned create action should update products cache or expose a refresh/adopt event used by Product List/Search surfaces.
```

Priority:

```txt
P2 — not blocking receive, but affects user expectation that created product appears everywhere immediately.
```

### GAP-LOCAL-02 — Local product duplicate detection is not handled in FE before create

Current status:

```txt
Local create opens only after no merged result for committedKeyword.
```

Remaining gap:

```txt
No dedicated duplicate-check step by barcode/name/model exists before POST create-local.
If the operator changes the local product name after empty search, duplicate risk can return.
```

Recommended owner:

```txt
FE-01 + BE-01
```

Recommended development action:

```txt
FE-01: before create-local, run one final operational/template search by local product name.
BE-01: ensure create-local has duplicate guard and returns existing/adoptable product where appropriate.
```

Priority:

```txt
P2 — important for catalog cleanliness, but backend duplicate guard is the stronger requirement.
```

### GAP-LOCAL-03 — Local product lifecycle after first stock receive is not represented as a single operator journey

Current status:

```txt
Create local -> adopt -> receive works as separated internal steps.
```

Remaining gap:

```txt
The UI does not clearly show lifecycle completion: created operational product, price source, stock received, product visible in branch.
```

Recommended owner:

```txt
FE-01
```

Recommended development action:

```txt
After receive success, show product id/name and provide a direct link/action to open branch Product Detail/List position.
```

Priority:

```txt
P2 — useful for closing the operator loop, not a backend blocker.
```

## 7. What should be done first to close Mission B

### First priority: certify and patch Operational Product List/Detail runtime surfaces

Reason:

```txt
Mission B cannot close if a product can be created/received in QuickStock but Product List or Product Detail still shows Template data, cannot find the operational product, or opens the wrong id.
```

Owner:

```txt
FE-01
```

Action:

```txt
Inspect and patch Product List / Product Detail entry points so they use Operational Product only and are branch-scoped by backend session.
```

### Second priority: make local create store-owned

Reason:

```txt
Local Operational Product lifecycle is currently page-owned while Template create is store-owned. This is enough for source-level flow, but not ideal for runtime consistency and cross-surface cache refresh.
```

Owner:

```txt
FE-01
```

Action:

```txt
Add productStore.createLocalOperationalProductAction and route QuickStock local create through it.
```

### Third priority: harden QuickStock operator UX around Product Discovery and price lifecycle

Reason:

```txt
The runtime paths exist, but operators need clearer source grouping and price semantics to avoid choosing Template vs Operational incorrectly or misunderstanding create price vs receive price.
```

Owner:

```txt
FE-01
```

Action:

```txt
Group ProductFinder results by Operational vs Template and clarify receive price labels.
```

### Fourth priority: backend contract confirmation for duplicate guards and product detail shape

Reason:

```txt
FE can reduce duplicate risk, but backend must enforce it. FE can open product detail only if backend returns a consistent branch operational shape.
```

Owner:

```txt
BE-01
```

Action:

```txt
Confirm create-local duplicate guard and /products/:id detail response shape for Operational Product only.
```

## 8. Summary table

| Gap | Area | Owner | Priority | Blocking Mission Close? |
|---|---|---:|---:|---:|
| GAP-LIST-01 | Product List Operational-only runtime | FE-01 | P1 | Yes |
| GAP-LIST-02 | Product Detail Operational-only runtime | FE-01 | P1 | Yes |
| GAP-PRODUCT-01 | Store-owned local create action | FE-01 | P1 | Likely |
| GAP-QS-03 | Receive price lifecycle clarity | FE-01 | P2 | Partial |
| GAP-SEARCH-01 | Search param consistency | FE-01 / BE-01 | P2 | Partial |
| GAP-LOCAL-01 | Cross-surface refresh after local create | FE-01 | P2 | No |
| GAP-LOCAL-02 | Local duplicate detection | FE-01 / BE-01 | P2 | Partial |
| GAP-LOCAL-03 | Post-receive operator closure | FE-01 | P2 | No |
| GAP-QS-01 | Finder result grouping | FE-01 | P2 | No |
| GAP-PRODUCT-02 | Lifecycle-safe edit/update fields | FE-01 / BE-01 | P2 | Partial |
| GAP-PRODUCT-03 | Shared runtime normalization | FE-01 | P3 | No |
| GAP-QS-02 | Extract LocalCreate panel | FE-01 | P3 | No |
| GAP-QS-04 | Legacy QuickStock action isolation | FE-01 / ROLE-ARCH | P3 | No |

## 9. Direct answers for ROLE-ARCH

### Product Runtime ยังเหลือช่องว่างอะไร

```txt
Operational Product runtime is mostly present, but Local create is not yet store-owned, edit/update fields are not fully lifecycle-safe, and runtime normalization is duplicated inside QuickStockPage.
```

### QuickStock Runtime ยังเหลืออะไร

```txt
QuickStock has the main Template/Operational/Local paths, but needs product source grouping, clearer price lifecycle, and eventual isolation from legacy non-canonical QuickStock actions.
```

### Product List / Product Detail / Search Runtime ยังมีอะไรไม่สมบูรณ์

```txt
Product List and Detail still need explicit Operational-only certification/patching. Search works in QuickStock but parameter normalization across all product surfaces is not yet unified.
```

### Local Operational Product Lifecycle ยังมีช่องว่างตรงไหน

```txt
Local create works at page level, but should become store-owned, should refresh or propagate to other product runtime surfaces, and should gain duplicate guard behavior around name/barcode before create.
```

### ช่องว่างใดควรทำก่อนเพื่อให้ Mission B ปิดได้

```txt
1. Product List Operational-only runtime.
2. Product Detail Operational-only runtime.
3. Store-owned local create action.
4. QuickStock source grouping / receive price clarity.
```

### แต่ละช่องว่างควรเป็น FE หรือ BE

```txt
Mostly FE-01 for runtime surface ownership.
BE-01 is needed only for duplicate guard confirmation, Product Detail response shape, and canonical search query contract.
ROLE-ARCH is only needed if legacy QuickStock paths should be formally deprecated or isolated.
```

## 10. Conclusion

```txt
NEEDS DEVELOPMENT — FE gaps remain before Mission B closure.
```

Recommended next assignment:

```txt
FE-01 — Operational Product List/Detail Runtime Closure
Scope:
- inspect current Product List and Product Detail pages/routes
- ensure Operational Product source only
- ensure Template Product cannot appear as branch runtime product
- ensure products created/received through QuickStock are visible/openable as Operational Products
```
