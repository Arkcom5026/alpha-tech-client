import React from "react";

const CommitActions = ({
  queueLength = 0,
  canCommit = false,
  isCommitting = false,
  onResetQueue,
  onCommit,
}) => (
  <div className="flex gap-2 justify-end">
    <button
      type="button"
      className="px-4 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
      disabled={queueLength === 0 || isCommitting}
      onClick={onResetQueue}
    >
      ล้างรายการ
    </button>
    <button
      type="button"
      className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      disabled={!canCommit}
      onClick={onCommit}
    >
      {isCommitting ? "กำลังบันทึก..." : `Commit ${queueLength} รายการ`}
    </button>
  </div>
);

export default CommitActions;
