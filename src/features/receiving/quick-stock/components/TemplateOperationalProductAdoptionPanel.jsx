const TemplateOperationalProductAdoptionPanel = ({
  isVisible,
  isBusy,
  onCreateOperationalProduct,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
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
        onClick={onCreateOperationalProduct}
      >
        {isBusy ? "กำลังสร้างสินค้าในร้าน..." : "สร้าง Operational Product จาก Template"}
      </button>
    </div>
  );
};

export default TemplateOperationalProductAdoptionPanel;
