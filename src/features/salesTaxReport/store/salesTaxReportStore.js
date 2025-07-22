import { create } from 'zustand';
import { subDays } from 'date-fns';
import { fetchSalesTaxReport } from '../api/salesTaxReportApi';


export const useSalesTaxReportStore = create((set) => ({
    salesTaxData: [],
    dateRange: {
        start: subDays(new Date(), 30), // เริ่มต้นย้อนหลัง 30 วัน
        end: new Date(),
    },

    setDateRange: (start, end) =>
        set(() => ({
            dateRange: { start, end },
        })),

    loadSalesTaxDataAction: async (startDate, endDate) => {
        try {
            const response = await fetchSalesTaxReport(startDate, endDate);
            set({ salesTaxData: response });
        } catch (error) {
            console.error('❌ โหลดรายงานภาษีขายล้มเหลว:', error);
        }
    },

}));
