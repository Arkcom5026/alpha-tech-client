import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowUpRight,
  BarChart3,
  Boxes,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Store,
  Users,
} from 'lucide-react';

const DashboardPage = () => {
  const { shopSlug } = useParams();
  const activeSlug = shopSlug || 'advancetech';

  const [storeName, setStoreName] = useState('กำลังเชื่อมต่อข้อมูลร้าน...');
  const [businessTypeLabel, setBusinessTypeLabel] = useState('กำลังประมวลผล...');
  const [stats, setStats] = useState({
    todaySales: 0,
    billCount: 0,
    newCustomers: 0,
    activeStock: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoadingStats(true);

      try {
        const profileRes = await axios.get(`/api/branch-prices/profile-by-slug/${activeSlug}`);
        if (profileRes.data) {
          setStoreName(profileRes.data.name || 'ร้านค้าพันธมิตร');
          setBusinessTypeLabel(profileRes.data.businessType || 'ทั่วไป');
        }

        const statsRes = await axios.get(`/api/pos/dashboard/summary-stats?slug=${activeSlug}`);
        if (statsRes.data) {
          setStats({
            todaySales: statsRes.data.todaySales || 0,
            billCount: statsRes.data.billCount || 0,
            newCustomers: statsRes.data.newCustomers || 0,
            activeStock: statsRes.data.activeStock || 0,
          });
        }
      } catch (error) {
        console.error('[Dashboard Live Fetch Error]', error);
        setStoreName(shopSlug ? `ร้านค้าพันธมิตร (${shopSlug})` : 'ร้านค้าพันธมิตร');
        setBusinessTypeLabel('ทั่วไป');
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, [activeSlug, shopSlug]);

  const ShimmerSkeleton = () => (
    <div className="w-full space-y-3" aria-hidden="true">
      <div className="h-4 w-1/2 animate-pulse rounded-md bg-slate-200/80" />
      <div className="h-8 w-3/4 animate-pulse rounded-xl bg-slate-200/80" />
      <div className="h-3 w-2/3 animate-pulse rounded-md bg-slate-200/80" />
    </div>
  );

  const metricCards = [
    {
      key: 'sales',
      label: 'ยอดขายวันนี้',
      value: `฿${stats.todaySales.toLocaleString()}`,
      description: 'ยอดขายจากรายการที่บันทึกวันนี้',
      icon: BarChart3,
      tone: 'teal',
    },
    {
      key: 'bills',
      label: 'จำนวนบิล',
      value: stats.billCount.toLocaleString(),
      description: 'อัปเดตจากรายการขายแบบเรียลไทม์',
      icon: ReceiptText,
      tone: 'blue',
    },
    {
      key: 'customers',
      label: 'ลูกค้าใหม่',
      value: stats.newCustomers.toLocaleString(),
      description: 'ลูกค้าใหม่ที่บันทึกเข้าสู่ระบบ',
      icon: Users,
      tone: 'violet',
    },
    {
      key: 'stock',
      label: 'สินค้าพร้อมขาย',
      value: stats.activeStock.toLocaleString(),
      description: 'รายการสต๊อกที่พร้อมดำเนินงาน',
      icon: Boxes,
      tone: 'emerald',
    },
  ];

  const toneClasses = {
    teal: {
      surface: 'bg-teal-50 text-teal-700 ring-teal-100',
      icon: 'bg-teal-50 text-teal-700',
      hover: 'hover:border-teal-200',
    },
    blue: {
      surface: 'bg-sky-50 text-sky-700 ring-sky-100',
      icon: 'bg-sky-50 text-sky-700',
      hover: 'hover:border-sky-200',
    },
    violet: {
      surface: 'bg-violet-50 text-violet-700 ring-violet-100',
      icon: 'bg-violet-50 text-violet-700',
      hover: 'hover:border-violet-200',
    },
    emerald: {
      surface: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
      icon: 'bg-emerald-50 text-emerald-700',
      hover: 'hover:border-emerald-200',
    },
  };

  return (
    <div className="w-full space-y-5 bg-slate-50 text-slate-800 selection:bg-teal-600 selection:text-white">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
            <Store className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-slate-900">{storeName}</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>ประเภทธุรกิจ:</span>
              <span className="font-medium text-slate-700">{businessTypeLabel}</span>
            </p>
          </div>
        </div>

        <div className="inline-flex min-h-10 shrink-0 items-center gap-2 self-start rounded-full bg-emerald-50 px-3.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-100 sm:self-center">
          <ShieldCheck className="h-4 w-4" />
          <span>ยืนยันการแยกข้อมูลร้านแล้ว</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          const tone = toneClasses[metric.tone];

          return (
            <article
              key={metric.key}
              className={`group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${tone.hover}`}
            >
              {isLoadingStats ? (
                <ShimmerSkeleton />
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <span className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-medium ring-1 ring-inset ${tone.surface}`}>
                      {metric.label}
                    </span>
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone.icon}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>

                  <p className="mt-4 text-3xl font-semibold text-slate-950">{metric.value}</p>

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-500">{metric.description}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-teal-600" />
                  </div>
                </>
              )}
            </article>
          );
        })}
      </section>

      <section className="flex min-h-36 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <PackageCheck className="h-5 w-5" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-slate-900">ข้อมูลวิเคราะห์กำลังเตรียมพร้อม</h2>
        <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
          พื้นที่นี้จะเชื่อมข้อมูลวิเคราะห์ยอดขายและการดำเนินงานเมื่อบริการสรุปผลพร้อมใช้งาน
        </p>
      </section>
    </div>
  );
};

export default DashboardPage;
