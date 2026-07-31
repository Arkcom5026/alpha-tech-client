import React from "react";
import CommitActions from "./CommitActions";
import { getCommitEligibility } from "./CommitEligibility";
import CommitSummary from "./CommitSummary";
import PostCommitNavigation from "./PostCommitNavigation";

const CommitBar = ({
  selectedProduct,
  barcodeQueue = [],
  productReady,
  queueReady,
  isCommitting,
  onResetQueue,
  onCommit,
}) => {
  const queueLength = barcodeQueue.length;
  const { canCommit, disabledReason } = getCommitEligibility({
    selectedProduct,
    queueLength,
    productReady,
    queueReady,
    isCommitting,
  });

  return (
    <section className="bg-white rounded-2xl shadow-sm border p-4 space-y-3">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <CommitSummary
          selectedProduct={selectedProduct}
          queueLength={queueLength}
          productReady={productReady}
          queueReady={queueReady}
          disabledReason={disabledReason}
        />
        <CommitActions
          queueLength={queueLength}
          canCommit={canCommit}
          isCommitting={isCommitting}
          onResetQueue={onResetQueue}
          onCommit={onCommit}
        />
      </div>

      <PostCommitNavigation
        selectedProduct={selectedProduct}
        onResetQueue={onResetQueue}
      />
    </section>
  );
};

export default CommitBar;
