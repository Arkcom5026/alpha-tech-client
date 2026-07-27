import test from "node:test";
import assert from "node:assert/strict";

import {
  INVENTORY_BEHAVIORS,
  buildLocalOperationalProductPayload,
  buildProductFormFromProduct,
  getProductInventoryBehavior,
  normalizeOperationalProduct,
} from "./quickStockRuntimeUtils.js";

test("legacy SIMPLE products default to tracked inventory", () => {
  assert.equal(
    getProductInventoryBehavior({ mode: "SIMPLE", productConfig: {} }),
    INVENTORY_BEHAVIORS.TRACKED
  );
});

test("NON_STOCK is read from productConfig and projected to runtime product", () => {
  const normalized = normalizeOperationalProduct({
    id: 91,
    mode: "SIMPLE",
    productConfig: { inventoryBehavior: "NON_STOCK" },
  });

  assert.equal(normalized.inventoryBehavior, INVENTORY_BEHAVIORS.NON_STOCK);
  assert.equal(buildProductFormFromProduct(normalized).inventoryBehavior, INVENTORY_BEHAVIORS.NON_STOCK);
});

test("local SIMPLE non-stock payload is server-readable and never tracks serial", () => {
  const payload = buildLocalOperationalProductPayload({
    productForm: {
      name: "ค่าบริการเปลี่ยนตลับหมึก",
      productTypeId: "12",
      brandId: "3",
      unitId: "1",
      mode: "SIMPLE",
      inventoryBehavior: "NON_STOCK",
      active: true,
    },
    priceForm: {
      costPrice: "0",
      priceRetail: "350",
      priceWholesale: "0",
      priceTechnician: "300",
      priceOnline: "0",
    },
  });

  assert.equal(payload.mode, "SIMPLE");
  assert.equal(payload.inventoryBehavior, "NON_STOCK");
  assert.equal(payload.noSN, true);
  assert.equal(payload.trackSerialNumber, false);
  assert.equal(payload.costPrice, 0);
  assert.equal(payload.priceRetail, 350);
});

test("structured product payload cannot carry non-stock behavior", () => {
  const payload = buildLocalOperationalProductPayload({
    productForm: {
      name: "Notebook",
      productTypeId: "4",
      mode: "STRUCTURED",
      inventoryBehavior: "NON_STOCK",
      active: true,
    },
    priceForm: { costPrice: "10000", priceRetail: "12000" },
  });

  assert.equal(payload.mode, "STRUCTURED");
  assert.equal(payload.trackSerialNumber, true);
  assert.equal(payload.noSN, false);
  assert.equal("inventoryBehavior" in payload, false);
});
