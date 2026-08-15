// src/features/receiving/quick-stock/pages/QuickStockPage.jsx

import { useState } from "react";
import { ConfirmActionDialog } from "@/design-system";
import ProductFinderPanel from "../../components/quick-stock/ProductFinderPanel";
import ProductMasterPanel from "../../components/quick-stock/ProductMasterPanel";
import IntakeControlPanel from "../../components/quick-stock/IntakeControlPanel";
import IntakeQueueTable from "../../components/quick-stock/IntakeQueueTable";
import QueueSummary from "../../components/quick-stock/QueueSummary";
import CommitBar from "../../components/quick-stock/CommitBar";
import QuickReceiptSessionPanel from "../components/QuickReceiptSessionPanel";
import LocalOperationalProductCreationPanel from "../components/LocalOperationalProductCreationPanel";
import useQuickStockRuntimeController from "../hooks/useQuickStockRuntimeController";

const QuickStockPage = () => {
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
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
    handleCreateLocalOperationalProduct,
    handleBarcodeSubmit,
    handleSerialSubmit,
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
      <QuickReceiptSessionPanel
        operationalProduct={operationalProduct}
        barcodeQueue={barcodeQueue}
        defaultCost={defaultCost}
        priceForm={priceForm}
        note={note}
        onCurrentLineSaved={() => {
          resetQueue();
          clearProductSelection();
        }}
      />

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
              setDefaultCost(buildPriceFormFromProduct(operationalProduct).costPrice ?? 0);
              setIsEditingProduct(false);
            }}
            onSaveProduct={handleSaveProductInline}
            onClearProduct={clearProductSelection}
            onDeleteProduct={() => setDeleteConfirmationOpen(true)}
            onProductFieldChange={updateProductForm}
            onPriceFieldChange={updatePriceForm}
          />

          <LocalOperationalProductCreationPanel
            isVisible={(noSearchResults || isLocalCreateOpen) && !operationalProduct}
            isOpen={isLocalCreateOpen}
            isBusy={isBusy}
            productTypes={productTypes}
            brands={brands}
            units={units}
            productForm={localProductForm}
            priceForm={localPriceForm}
            onOpen={openLocalCreateForm}
            onProductFieldChange={updateLocalProductForm}
            onPriceFieldChange={updateLocalPriceForm}
            onCreate={handleCreateLocalOperationalProduct}
          />
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
          <QueueSummary total={barcodeQueue.length} readyCount={readyCount} needDataCount={needDataCount} productReady={productReady} />
          <IntakeQueueTable
            barcodeQueue={barcodeQueue}
            serialInputRefs={serialInputRefs}
            onSerialSubmit={handleSerialSubmit}
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
      <ConfirmActionDialog
        open={deleteConfirmationOpen}
        title="ยืนยันการลบสินค้า"
        description={operationalProduct ? `ลบ ${operationalProduct.name} ออกจากระบบ ใช้เฉพาะรายการซ้ำหรือผิดที่ยังไม่มีประวัติรับเข้า` : ''}
        confirmLabel="ยืนยันลบสินค้า"
        loadingLabel="กำลังลบ..."
        intent="destructive"
        loading={isDeletingProduct}
        onConfirm={async () => {
          const deleted = await handleDeleteSelectedProductForRecovery();
          if (deleted) setDeleteConfirmationOpen(false);
        }}
        onClose={() => {
          if (!isDeletingProduct) setDeleteConfirmationOpen(false);
        }}
      />
    </div>
  );
};

export default QuickStockPage;
