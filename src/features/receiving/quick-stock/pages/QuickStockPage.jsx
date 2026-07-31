// src/features/receiving/quick-stock/pages/QuickStockPage.jsx

import ProductFinderPanel from "../components/QuickStockFinderPanel";
import ProductMasterPanel from "../components/QuickStockReceiveTable";
import IntakeControlPanel from "../components/QuickStockToolbar";
import IntakeQueueTable from "../components/QuickStockSerialDialog";
import QueueSummary from "../components/QuickStockSummary";
import CommitBar from "../components/QuickStockCommitBar";
import QuickReceiptSessionPanel from "../components/QuickReceiptSessionPanel";
import TemplateOperationalProductAdoptionPanel from "../components/TemplateOperationalProductAdoptionPanel";
import LocalOperationalProductCreationPanel from "../components/LocalOperationalProductCreationPanel";
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
            onDeleteProduct={handleDeleteSelectedProductForRecovery}
            onProductFieldChange={updateProductForm}
            onPriceFieldChange={updatePriceForm}
          />

          <TemplateOperationalProductAdoptionPanel
            isVisible={isTemplateOnlySelection}
            isBusy={isBusy}
            onCreateOperationalProduct={handleCreateOperationalProductFromTemplate}
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
