import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BadgeAlert, Building2, FileText, Landmark, UserCheck, Wallet } from 'lucide-react';
import FinanceActionCard from '../components/workspace/FinanceActionCard';
import FinanceMetricCard from '../components/workspace/FinanceMetricCard';
import FinanceWorkspaceHeader from '../components/workspace/FinanceWorkspaceHeader';
import FinanceWorkspaceSection from '../components/workspace/FinanceWorkspaceSection';

const FinanceDashboardPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();

  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-4 text-slate-800 md:p-6">
      <FinanceWorkspaceHeader
        title="ระบบการเงิน"
        description="ภาพรวมลูกหนี้ เครดิตลูกค้า และการเคลื่อนไหวทางการเงินระดับสาขา"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FinanceMetricCard
          label="ยอดค้างรวม"
          value="฿0.00"
          hint="รวมยอดที่ยังไม่ได้ชำระทั้งหมด"
          tone="danger"
          icon={Wallet}
        />
        <FinanceMetricCard
          label="จำนวนบิลค้าง"
          value="0 บิล"
          hint="ใบขายที่สถานะยังชำระไม่ครบ"
          tone="warn"
          icon={FileText}
        />
        <FinanceMetricCard
          label="เครดิตลูกค้าที่ใช้งาน"
          value="0 ราย"
          hint="ลูกค้าที่มีวงเงินหรือยอดค้าง"
          tone="info"
          icon={UserCheck}
        />
      </div>

      <FinanceWorkspaceSection
        title="เมนูจัดการบัญชี"
        description="เข้าถึงลูกหนี้ เครดิตลูกค้า และเจ้าหนี้ Supplier โดยรักษาขอบเขตสาขาปัจจุบัน"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <FinanceActionCard
            title="จัดการลูกหนี้"
            description="ตรวจสอบบิลค้างจ่ายและบันทึกตัดชำระหนี้"
            icon={Landmark}
            onClick={() => navigate(`/${shopSlug}/pos/finance/ar`)}
          />
          <FinanceActionCard
            title="ตรวจสอบเครดิตลูกค้า"
            description="คุมวงเงินและตรวจประวัติยอดค้างรายลูกค้า"
            icon={BadgeAlert}
            onClick={() => navigate(`/${shopSlug}/pos/finance/customer-credit`)}
          />
          <FinanceActionCard
            title="จัดการเจ้าหนี้ Supplier"
            description="ตั้งหนี้จากใบรับสินค้าและตรวจสอบยอดคงค้าง"
            icon={Building2}
            onClick={() => navigate(`/${shopSlug}/pos/finance/supplier-payables`)}
          />
        </div>
      </FinanceWorkspaceSection>
    </div>
  );
};

export default FinanceDashboardPage;
