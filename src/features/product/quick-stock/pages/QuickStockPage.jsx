// src/features/product/quick-stock/pages/QuickStockPage.jsx

import ProductFinderPanel from "../components/QuickStockFinderPanel";
import ProductMasterPanel from "../components/QuickStockReceiveTable";
import IntakeControlPanel from "../components/QuickStockToolbar";
import IntakeQueueTable from "../components/QuickStockSerialDialog";
import QueueSummary from "../components/QuickStockSummary";
import CommitBar from "../components/QuickStockCommitBar";
import useQuickStockRuntimeController from "../hooks/useQuickStockRuntimeController";

const QuickStockPage = () => {
  const {
    barcodeInputRef,
    serialInputRefs,

    dropdownsLoading,
    isLoading,

    productTypes,
    brands,
    units,

    selectedProductTypeId,
    setSelectedProductTypeId,
    selectedBrandId,
    setSelectedBrandId,
    selectedProductId,
    setSelectedProductId,
    keyword,
    setKeyword,
    committedKeyword,
    setCommittedKeyword,
    showSearchResult,
    setShowSearchResult,
    setAdoptedOperationalProduct,
    isLocalCreateOpen,
    setIsLocalCreateOpen,

    barcode,
    setBarcode,
    barcodeQueue,
    autoFocusSerial,
    setAutoFocusSerial,

    defaultCost,
    setDefaultCost,
    note,
    setNote,

    isCommitting,
    isEditingProduct,
    setIsEditingProduct,
    isSavingProduct,
    isDeletingProduct,

    productForm,
    setProductForm,
    priceForm,
    setPriceForm,

    localProductForm,
    localPriceForm,

    filteredProducts,
    selectedProduct,
    selectedTemplateProduct,
    operationalProduct,
    isTemplateOnlySelection,
    runtimeStatus,

    readyCount,
    needDataCount,
    queueReady,
    productReady,
    isBusy,
    noSearchResults,

    intakeRuntimeProduct,
    commitRuntimeProduct,

    executeProductSearch,
    resetQueue,
    clearProductSelection,
    updateProductForm,
    updatePriceForm,
    updateLocalProductForm,
    updateLocalPriceForm,
    selectProduct,
    handleCreateOperationalProductFromTemplate,
    handleCreateLocalOperationalProduct,
    handleBarcodeSubmit,
    removeQueueItem,
    updateQueueItemField,
    handleSaveProductInline,
    handleDeleteSelectedProductForRecovery,
    handleCommit,
    openLocalCreateForm,

    getBrandName,
    getProductTypeName,
    getProductUnitName,
    buildProductFormFromProduct,
    buildPriceFormFromProduct,
  } = useQuickStockRuntimeController();

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 xl:p-6 space-y-4">
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-4">
        <div className="2xl:col-span-4 space-y-4">
          <ProductFinderPanel
            selectedProduct={selectedProduct}
            showSearchResult={showSearchResult}
            onShowSearchResult={() => setShowSearchResult(true)}
            productTypes={productTypes}
            brands={brands}
            selectedProductTypeId={selectedProductTypeId}
            selectedBrandId={selectedBrandId}
            keyword={keyword}
            filteredProducts={filteredProducts}
            selectedProductId={selectedProductId}
            dropdownsLoading={dropdownsLoading}
            isLoading={isLoading || isBusy}
            onProductTypeChange={(value) => {
              setSelectedProductTypeId(value);
              setSelectedBrandId("");
              setSelectedProductId("");
              setAdoptedOperationalProduct(null);
              setIsLocalCreateOpen(false);
              setShowSearchResult(true);
              resetQueue();
              executeProductSearch({ productTypeId: value, brandId: "", search: committedKeyword });
            }}
            onBrandChange={(value) => {
              setSelectedBrandId(value);
              setSelectedProductId("");
              setAdoptedOperationalProduct(null);
              setIsLocalCreateOpen(false);
              setShowSearchResult(true);
              resetQueue();
              executeProductSearch({ brandId: value, search: committedKeyword });
            }}
            onKeywordChange={(value) => {
              setKeyword(value);
              setSelectedProductId("");
              setAdoptedOperationalProduct(null);
              setIsLocalCreateOpen(false);
              setShowSearchResult(true);
              resetQueue();
            }}
            onSearch={() => {
              const nextKeyword = String(keyword || "").trim();
              setCommittedKeyword(nextKeyword);
              setShowSearchResult(true);
              executeProductSearch({ search: nextKeyword });
            }}
            onKeywordEnter={(value) => {
              const nextKeyword = String(value || "").trim();
              setCommittedKeyword(nextKeyword);
              setShowSearchResult(true);
              executeProductSearch({ search: nextKeyword });
            }}
            onSelectProduct={selectProduct}
            getBrandName={getBrandName}
            getProductTypeName={getProductTypeName}
            getProductUnitName={getProductUnitName}
          />

          <ProductMasterPanel
            selectedProduct={operationalProduct}
            selectedTemplateProduct={selectedTemplateProduct}
            runtimeStatus={runtimeStatus}
            productTypes={productTypes}
            brands={brands}
            units={units}
            productForm={productForm}
            priceForm={priceForm}
            isEditingProduct={isEditingProduct}
            isSavingProduct={isSavingProduct}
            isDeletingProduct={isDeletingProduct}
            onEditStart={() => setIsEditingProduct(true)}
            onEditCancel={() => {
              setProductForm(buildProductFormFromProduct(operationalProduct));
              setPriceForm(buildPriceFormFromProduct(operationalProduct));
              setDefaultCost(buildPriceFormFromProduct(operationalProduct).costPrice || "");
              setIsEditingProduct(false);
            }}
            onSaveProduct={handleSaveProductInline}
            onClearProduct={clearProductSelection}
            onDeleteProduct={handleDeleteSelectedProductForRecovery}
            onProductFieldChange={updateProductForm}
            onPriceFieldChange={updatePriceForm}
          />

          {isTemplateOnlySelection && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <div>
                <p className="font-semibold text-amber-900">สินค้านี้ยังเป็น Template</p>
                <p className="text-sm text-amber-800">
                  สร้าง Operational Product ของร้านก่อน จึงจะรับบาร์โค้ดหรือบันทึก Stock Intake ได้
                </p>
              </div>
              <button
                type="button"
                className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isBusy}
                onClick={handleCreateOperationalProductFromTemplate}
              >
                {isBusy ? "กำลังสร้างสินค้าในร้าน..." : "สร้าง Operational Product จาก Template"}
              </button>
            </div>
          )}

          {(noSearchResults || isLocalCreateOpen) && !operationalProduct && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">สร้างสินค้า Local ของร้าน</p>
                  <p className="text-sm text-slate-600">
                    ใช้เมื่อไม่มี Template หรือสินค้าในร้านที่เหมาะสม ระบบจะสร้าง Operational Product ก่อนรับเข้า
                  </p>
                </div>
                {!isLocalCreateOpen && (
                  <button
                    type="button"
                    className="rounded-lg border px-3 py-1.5 text-sm"
                    onClick={openLocalCreateForm}
                  >
                    เปิดฟอร์ม
                  </button>
                )}
              </div>

              {isLocalCreateOpen && (
                <div className="space-y-3">
                  <input
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="ชื่อสินค้า"
                    value={localProductForm.name}
                    onChange={(e) => updateLocalProductForm("name", e.target.value)}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <select
                      className="rounded-lg border px-3 py-2 text-sm"
                      value={localProductForm.productTypeId}
                      onChange={(e) => updateLocalProductForm("productTypeId", e.target.value)}
                    >
                      <option value="">เลือกประเภทสินค้า</option>
                      {productTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>

                    <select
                      className="rounded-lg border px-3 py-2 text-sm"
                      value={localProductForm.brandId}
                      onChange={(e) => updateLocalProductForm("brandId", e.target.value)}
                    >
                      <option value="">เลือกแบรนด์</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>

                    <select
                      className="rounded-lg border px-3 py-2 text-sm"
                      value={localProductForm.unitId}
                      onChange={(e) => updateLocalProductForm("unitId", e.target.value)}
                    >
                      <option value="">เลือกหน่วย</option>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name}
                        </option>
                      ))}
                    </select>

                    <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={localProductForm.trackSerialNumber}
                        onChange={(e) => updateLocalProductForm("trackSerialNumber", e.target.checked)}
                      />
                      ติดตาม Serial Number
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      className="rounded-lg border px-3 py-2 text-sm"
                      placeholder="ราคาทุน"
                      value={localPriceForm.costPrice}
                      onChange={(e) => updateLocalPriceForm("costPrice", e.target.value)}
                    />
                    <input
                      className="rounded-lg border px-3 py-2 text-sm"
                      placeholder="ราคาขายปลีก"
                      value={localPriceForm.priceRetail}
                      onChange={(e) => updateLocalPriceForm("priceRetail", e.target.value)}
                    />
                    <input
                      className="rounded-lg border px-3 py-2 text-sm"
                      placeholder="ราคาส่ง"
                      value={localPriceForm.priceWholesale}
                      onChange={(e) => updateLocalPriceForm("priceWholesale", e.target.value)}
                    />
                    <input
                      className="rounded-lg border px-3 py-2 text-sm"
                      placeholder="ราคาช่าง"
                      value={localPriceForm.priceTechnician}
                      onChange={(e) => updateLocalPriceForm("priceTechnician", e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isBusy}
                    onClick={handleCreateLocalOperationalProduct}
                  >
                    {isBusy ? "กำลังสร้างสินค้า Local..." : "สร้างสินค้า Local และ Adopt เข้า QuickStock"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="2xl:col-span-8 space-y-4">
          <IntakeControlPanel
            selectedProduct={intakeRuntimeProduct}
            barcodeInputRef={barcodeInputRef}
            barcode={barcode}
            setBarcode={setBarcode}
            autoFocusSerial={autoFocusSerial}
            setAutoFocusSerial={setAutoFocusSerial}
            defaultCost={defaultCost}
            setDefaultCost={setDefaultCost}
            priceForm={priceForm}
            onPriceFieldChange={updatePriceForm}
            note={note}
            setNote={setNote}
            isCommitting={isCommitting}
            onBarcodeSubmit={handleBarcodeSubmit}
          />

          <QueueSummary
            total={barcodeQueue.length}
            readyCount={readyCount}
            needDataCount={needDataCount}
            productReady={productReady}
          />

          <IntakeQueueTable
            barcodeQueue={barcodeQueue}
            serialInputRefs={serialInputRefs}
            barcodeInputRef={barcodeInputRef}
            onUpdateQueueItemField={updateQueueItemField}
            onRemoveQueueItem={removeQueueItem}
          />

          <CommitBar
            selectedProduct={commitRuntimeProduct}
            barcodeQueue={barcodeQueue}
            productReady={productReady}
            queueReady={queueReady}
            isCommitting={isCommitting}
            onResetQueue={resetQueue}
            onCommit={handleCommit}
          />
        </div>
      </div>
    </div>
  );
};

export default QuickStockPage;
