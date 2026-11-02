import { ColumnInfo, SheetData, WorkbookData } from '../types';

export const getSampleSalesData = (lang: 'ar' | 'en'): WorkbookData => {
  const isAr = lang === 'ar';

  const rows = [
  // Month 1: Jan 2024
    {
      [isAr ? 'الرقم المرجعي' : 'Order ID']: 'ORD-2024-001',
      [isAr ? 'التاريخ' : 'Date']: '2024-01-15',
      [isAr ? 'اسم الصنف' : 'Item Name']: isAr ? 'لابتوب ديل إكس بي إس 15' : 'Dell XPS 15 Laptop',
      [isAr ? 'القسم / الفئة' : 'Category']: isAr ? 'أجهزة الحاسب' : 'Computers & Laptops',
      [isAr ? 'الفرع / المنطقة' : 'Region']: isAr ? 'الرياض' : 'Riyadh',
      [isAr ? 'الكمية المباعة' : 'Sold Qty']: 45,
      [isAr ? 'المخزون الحالي' : 'Current Stock']: 12,
      [isAr ? 'قيمة المبيعات' : 'Revenue']: 225000,
      [isAr ? 'التكلفة' : 'Cost']: 157500,
      [isAr ? 'صافي الربح' : 'Profit']: 67500,
      [isAr ? 'حالة الطلب' : 'Status']: isAr ? 'مكتمل' : 'Completed',
      [isAr ? 'اسم العميل' : 'Client']: isAr ? 'مجموعة التقنية المتقدمة' : 'Advanced Tech Group',
      [isAr ? 'نسبة الإنجاز' : 'Progress %']: 100,
    },
    {
      [isAr ? 'الرقم المرجعي' : 'Order ID']: 'ORD-2024-002',
      [isAr ? 'التاريخ' : 'Date']: '2024-01-28',
      [isAr ? 'اسم الصنف' : 'Item Name']: isAr ? 'آيفون 15 برو ماكس 256 جيجا' : 'iPhone 15 Pro Max 256GB',
      [isAr ? 'القسم / الفئة' : 'Category']: isAr ? 'الهواتف الذكية' : 'Smartphones',
      [isAr ? 'الفرع / المنطقة' : 'Region']: isAr ? 'جدة' : 'Jeddah',
      [isAr ? 'الكمية المباعة' : 'Sold Qty']: 85,
      [isAr ? 'المخزون الحالي' : 'Current Stock']: 18,
      [isAr ? 'قيمة المبيعات' : 'Revenue']: 425000,
      [isAr ? 'التكلفة' : 'Cost']: 314500,
      [isAr ? 'صافي الربح' : 'Profit']: 110500,
      [isAr ? 'حالة الطلب' : 'Status']: isAr ? 'مكتمل' : 'Completed',
      [isAr ? 'اسم العميل' : 'Client']: isAr ? 'شركة الخليج للتجارة' : 'Gulf Trading Co',
      [isAr ? 'نسبة الإنجاز' : 'Progress %']: 100,
    },

    // Month 2: Feb 2024
    {
      [isAr ? 'الرقم المرجعي' : 'Order ID']: 'ORD-2024-003',
      [isAr ? 'التاريخ' : 'Date']: '2024-02-05',
      [isAr ? 'اسم الصنف' : 'Item Name']: isAr ? 'شاشة سامسونج أوديسي 32 بوصة' : 'Samsung Odyssey 32" Monitor',
      [isAr ? 'القسم / الفئة' : 'Category']: isAr ? 'الشاشات والملحقات' : 'Monitors & Accessories',
      [isAr ? 'الفرع / المنطقة' : 'Region']: isAr ? 'الدمام' : 'Dammam',
      [isAr ? 'الكمية المباعة' : 'Sold Qty']: 30,
      [isAr ? 'المخزون الحالي' : 'Current Stock']: 25,
      [isAr ? 'قيمة المبيعات' : 'Revenue']: 75000,
      [isAr ? 'التكلفة' : 'Cost']: 52500,
      [isAr ? 'صافي الربح' : 'Profit']: 22500,
      [isAr ? 'حالة الطلب' : 'Status']: isAr ? 'قيد التنفيذ' : 'In Progress',
      [isAr ? 'اسم العميل' : 'Client']: isAr ? 'مؤسسة الرواد' : 'Al-Ruwad Est',
      [isAr ? 'نسبة الإنجاز' : 'Progress %']: 65,
    },
    {
      [isAr ? 'الرقم المرجعي' : 'Order ID']: 'ORD-2024-004',
      [isAr ? 'التاريخ' : 'Date']: '2024-02-20',
      [isAr ? 'اسم الصنف' : 'Item Name']: isAr ? 'ماك بوك برو M3 ماكس' : 'MacBook Pro M3 Max',
      [isAr ? 'القسم / الفئة' : 'Category']: isAr ? 'أجهزة الحاسب' : 'Computers & Laptops',
      [isAr ? 'الفرع / المنطقة' : 'Region']: isAr ? 'الرياض' : 'Riyadh',
      [isAr ? 'الكمية المباعة' : 'Sold Qty']: 60,
      [isAr ? 'المخزون الحالي' : 'Current Stock']: 8,
      [isAr ? 'قيمة المبيعات' : 'Revenue']: 480000,
      [isAr ? 'التكلفة' : 'Cost']: 336000,
      [isAr ? 'صافي الربح' : 'Profit']: 144000,
      [isAr ? 'حالة الطلب' : 'Status']: isAr ? 'مكتمل' : 'Completed',
      [isAr ? 'اسم العميل' : 'Client']: isAr ? 'بنك الأمل' : 'Al-Amal Bank',
      [isAr ? 'نسبة الإنجاز' : 'Progress %']: 100,
    },

    // Month 3: Mar 2024
    {
      [isAr ? 'الرقم المرجعي' : 'Order ID']: 'ORD-2024-005',
      [isAr ? 'التاريخ' : 'Date']: '2024-03-08',
      [isAr ? 'اسم الصنف' : 'Item Name']: isAr ? 'سماعات آبل إيربودز برو 2' : 'Apple AirPods Pro 2',
      [isAr ? 'القسم / الفئة' : 'Category']: isAr ? 'الصوتيات والملحقات' : 'Audio & Accessories',
      [isAr ? 'الفرع / المنطقة' : 'Region']: isAr ? 'جدة' : 'Jeddah',
      [isAr ? 'الكمية المباعة' : 'Sold Qty']: 140,
      [isAr ? 'المخزون الحالي' : 'Current Stock']: 15,
      [isAr ? 'قيمة المبيعات' : 'Revenue']: 140000,
      [isAr ? 'التكلفة' : 'Cost']: 84000,
      [isAr ? 'صافي الربح' : 'Profit']: 56000,
      [isAr ? 'حالة الطلب' : 'Status']: isAr ? 'مكتمل' : 'Completed',
      [isAr ? 'اسم العميل' : 'Client']: isAr ? 'الشركة الوطنية للأغذية' : 'National Food Co',
      [isAr ? 'نسبة الإنجاز' : 'Progress %']: 100,
    },
    {
      [isAr ? 'الرقم المرجعي' : 'Order ID']: 'ORD-2024-006',
      [isAr ? 'التاريخ' : 'Date']: '2024-03-22',
      [isAr ? 'اسم الصنف' : 'Item Name']: isAr ? 'طابعة ليزر إتش بي ملونة' : 'HP Color LaserJet Printer',
      [isAr ? 'القسم / الفئة' : 'Category']: isAr ? 'معدات المكاتب' : 'Office Equipment',
      [isAr ? 'الفرع / المنطقة' : 'Region']: isAr ? 'الخبر' : 'Khobar',
      [isAr ? 'الكمية المباعة' : 'Sold Qty']: 12,
      [isAr ? 'المخزون الحالي' : 'Current Stock']: 40,
      [isAr ? 'قيمة المبيعات' : 'Revenue']: 36000,
      [isAr ? 'التكلفة' : 'Cost']: 27000,
      [isAr ? 'صافي الربح' : 'Profit']: 9000,
      [isAr ? 'حالة الطلب' : 'Status']: isAr ? 'متأخر' : 'Delayed',
      [isAr ? 'اسم العميل' : 'Client']: isAr ? 'سلسلة متاجر الشرق' : 'Orient Stores',
      [isAr ? 'نسبة الإنجاز' : 'Progress %']: 40,
    },

    // Month 4: Apr 2024
    {
      [isAr ? 'الرقم المرجعي' : 'Order ID']: 'ORD-2024-007',
      [isAr ? 'التاريخ' : 'Date']: '2024-04-10',
      [isAr ? 'اسم الصنف' : 'Item Name']: isAr ? 'آيفون 15 برو ماكس 256 جيجا' : 'iPhone 15 Pro Max 256GB',
      [isAr ? 'القسم / الفئة' : 'Category']: isAr ? 'الهواتف الذكية' : 'Smartphones',
      [isAr ? 'الفرع / المنطقة' : 'Region']: isAr ? 'الرياض' : 'Riyadh',
      [isAr ? 'الكمية المباعة' : 'Sold Qty']: 95,
      [isAr ? 'المخزون الحالي' : 'Current Stock']: 14,
      [isAr ? 'قيمة المبيعات' : 'Revenue']: 475000,
      [isAr ? 'التكلفة' : 'Cost']: 351500,
      [isAr ? 'صافي الربح' : 'Profit']: 123500,
      [isAr ? 'حالة الطلب' : 'Status']: isAr ? 'مكتمل' : 'Completed',
      [isAr ? 'اسم العميل' : 'Client']: isAr ? 'شركة التطوير العقاري' : 'Real Estate Dev',
      [isAr ? 'نسبة الإنجاز' : 'Progress %']: 100,
    },
    {
      [isAr ? 'الرقم المرجعي' : 'Order ID']: 'ORD-2024-008',
      [isAr ? 'التاريخ' : 'Date']: '2024-04-25',
      [isAr ? 'اسم الصنف' : 'Item Name']: isAr ? 'آيباد إير الجيل الخامس' : 'iPad Air 5th Gen',
      [isAr ? 'القسم / الفئة' : 'Category']: isAr ? 'الأجهزة اللوحية' : 'Tablets',
      [isAr ? 'الفرع / المنطقة' : 'Region']: isAr ? 'مكة المكرمة' : 'Makkah',
      [isAr ? 'الكمية المباعة' : 'Sold Qty']: 42,
      [isAr ? 'المخزون الحالي' : 'Current Stock']: 19,
      [isAr ? 'قيمة المبيعات' : 'Revenue']: 126000,
      [isAr ? 'التكلفة' : 'Cost']: 88200,
      [isAr ? 'صافي الربح' : 'Profit']: 37800,
      [isAr ? 'حالة الطلب' : 'Status']: isAr ? 'مكتمل' : 'Completed',
      [isAr ? 'اسم العميل' : 'Client']: isAr ? 'فنادق الضيافة' : 'Hospitality Hotels',
      [isAr ? 'نسبة الإنجاز' : 'Progress %']: 100,
    },

    // Month 5: May 2024
    {
      [isAr ? 'الرقم المرجعي' : 'Order ID']: 'ORD-2024-009',
      [isAr ? 'التاريخ' : 'Date']: '2024-05-12',
      [isAr ? 'اسم الصنف' : 'Item Name']: isAr ? 'كاميرا مراقبة ذكية 4K' : '4K Smart Security Camera',
      [isAr ? 'القسم / الفئة' : 'Category']: isAr ? 'الأنظمة الأمنية' : 'Security Systems',
      [isAr ? 'الفرع / المنطقة' : 'Region']: isAr ? 'الدمام' : 'Dammam',
      [isAr ? 'الكمية المباعة' : 'Sold Qty']: 18,
      [isAr ? 'المخزون الحالي' : 'Current Stock']: 55,
      [isAr ? 'قيمة المبيعات' : 'Revenue']: 27000,
      [isAr ? 'التكلفة' : 'Cost']: 18900,
      [isAr ? 'صافي الربح' : 'Profit']: 8100,
      [isAr ? 'حالة الطلب' : 'Status']: isAr ? 'معلق' : 'Pending',
      [isAr ? 'اسم العميل' : 'Client']: isAr ? 'مصنع الحديد والصلب' : 'Steel Works Factory',
      [isAr ? 'نسبة الإنجاز' : 'Progress %']: 30,
    },
    {
      [isAr ? 'الرقم المرجعي' : 'Order ID']: 'ORD-2024-010',
      [isAr ? 'التاريخ' : 'Date']: '2024-05-28',
      [isAr ? 'اسم الصنف' : 'Item Name']: isAr ? 'لابتوب ديل إكس بي إس 15' : 'Dell XPS 15 Laptop',
      [isAr ? 'القسم / الفئة' : 'Category']: isAr ? 'أجهزة الحاسب' : 'Computers & Laptops',
      [isAr ? 'الفرع / المنطقة' : 'Region']: isAr ? 'الرياض' : 'Riyadh',
      [isAr ? 'الكمية المباعة' : 'Sold Qty']: 55,
      [isAr ? 'المخزون الحالي' : 'Current Stock']: 9,
      [isAr ? 'قيمة المبيعات' : 'Revenue']: 275000,
      [isAr ? 'التكلفة' : 'Cost']: 192500,
      [isAr ? 'صافي الربح' : 'Profit']: 82500,
      [isAr ? 'حالة الطلب' : 'Status']: isAr ? 'مكتمل' : 'Completed',
      [isAr ? 'اسم العميل' : 'Client']: isAr ? 'هيئة الخدمات اللوجستية' : 'Logistics Authority',
      [isAr ? 'نسبة الإنجاز' : 'Progress %']: 100,
    },

    // Month 6: Jun 2024
    {
      [isAr ? 'الرقم المرجعي' : 'Order ID']: 'ORD-2024-011',
      [isAr ? 'التاريخ' : 'Date']: '2024-06-14',
      [isAr ? 'اسم الصنف' : 'Item Name']: isAr ? 'ماك بوك برو M3 ماكس' : 'MacBook Pro M3 Max',
      [isAr ? 'القسم / الفئة' : 'Category']: isAr ? 'أجهزة الحاسب' : 'Computers & Laptops',
      [isAr ? 'الفرع / المنطقة' : 'Region']: isAr ? 'جدة' : 'Jeddah',
      [isAr ? 'الكمية المباعة' : 'Sold Qty']: 70,
      [isAr ? 'المخزون الحالي' : 'Current Stock']: 6,
      [isAr ? 'قيمة المبيعات' : 'Revenue']: 560000,
      [isAr ? 'التكلفة' : 'Cost']: 392000,
      [isAr ? 'صافي الربح' : 'Profit']: 168000,
      [isAr ? 'حالة الطلب' : 'Status']: isAr ? 'مكتمل' : 'Completed',
      [isAr ? 'اسم العميل' : 'Client']: isAr ? 'شركة الطيران الدولية' : 'Intl Airlines',
      [isAr ? 'نسبة الإنجاز' : 'Progress %']: 100,
    },
    {
      [isAr ? 'الرقم المرجعي' : 'Order ID']: 'ORD-2024-012',
      [isAr ? 'التاريخ' : 'Date']: '2024-06-30',
      [isAr ? 'اسم الصنف' : 'Item Name']: isAr ? 'راوتر سيسكو للأعمال Wi-Fi 6' : 'Cisco Business Wi-Fi 6 Router',
      [isAr ? 'القسم / الفئة' : 'Category']: isAr ? 'الشبكات والاتصالات' : 'Networking',
      [isAr ? 'الفرع / المنطقة' : 'Region']: isAr ? 'الرياض' : 'Riyadh',
      [isAr ? 'الكمية المباعة' : 'Sold Qty']: 35,
      [isAr ? 'المخزون الحالي' : 'Current Stock']: 22,
      [isAr ? 'قيمة المبيعات' : 'Revenue']: 70000,
      [isAr ? 'التكلفة' : 'Cost']: 45500,
      [isAr ? 'صافي الربح' : 'Profit']: 24500,
      [isAr ? 'حالة الطلب' : 'Status']: isAr ? 'قيد التنفيذ' : 'In Progress',
      [isAr ? 'اسم العميل' : 'Client']: isAr ? 'جامعة المعرفة' : 'Knowledge University',
      [isAr ? 'نسبة الإنجاز' : 'Progress %']: 70,
    },

    // Month 7: Jul 2024
    {
      [isAr ? 'الرقم المرجعي' : 'Order ID']: 'ORD-2024-07-05',
      [isAr ? 'التاريخ' : 'Date']: '2024-07-05',
      [isAr ? 'اسم الصنف' : 'Item Name']: isAr ? 'سامسونج جالكسي S24 ألترا' : 'Samsung Galaxy S24 Ultra',
      [isAr ? 'القسم / الفئة' : 'Category']: isAr ? 'الهواتف الذكية' : 'Smartphones',
      [isAr ? 'الفرع / المنطقة' : 'Region']: isAr ? 'الرياض' : 'Riyadh',
      [isAr ? 'الكمية المباعة' : 'Sold Qty']: 110,
      [isAr ? 'المخزون الحالي' : 'Current Stock']: 10,
      [isAr ? 'قيمة المبيعات' : 'Revenue']: 495000,
      [isAr ? 'التكلفة' : 'Cost']: 346500,
      [isAr ? 'صافي الربح' : 'Profit']: 148500,
      [isAr ? 'حالة الطلب' : 'Status']: isAr ? 'مكتمل' : 'Completed',
      [isAr ? 'اسم العميل' : 'Client']: isAr ? 'مستشفى السلام الطبي' : 'Al-Salam Medical Hospital',
      [isAr ? 'نسبة الإنجاز' : 'Progress %']: 100,
    },
    {
      [isAr ? 'الرقم المرجعي' : 'Order ID']: 'ORD-2024-07-20',
      [isAr ? 'التاريخ' : 'Date']: '2024-07-20',
      [isAr ? 'اسم الصنف' : 'Item Name']: isAr ? 'لوحة مفاتيح ميكانيكية لوجيتك' : 'Logitech Mechanical Keyboard',
      [isAr ? 'القسم / الفئة' : 'Category']: isAr ? 'الشاشات والملحقات' : 'Monitors & Accessories',
      [isAr ? 'الفرع / المنطقة' : 'Region']: isAr ? 'الدمام' : 'Dammam',
      [isAr ? 'الكمية المباعة' : 'Sold Qty']: 8,
      [isAr ? 'المخزون الحالي' : 'Current Stock']: 65,
      [isAr ? 'قيمة المبيعات' : 'Revenue']: 5600,
      [isAr ? 'التكلفة' : 'Cost']: 3900,
      [isAr ? 'صافي الربح' : 'Profit']: 1700,
      [isAr ? 'حالة الطلب' : 'Status']: isAr ? 'مكتمل' : 'Completed',
      [isAr ? 'اسم العميل' : 'Client']: isAr ? 'موانئ الشرق' : 'Eastern Ports',
      [isAr ? 'نسبة الإنجاز' : 'Progress %']: 100,
    },

    // Month 8: Aug 2024
    {
      [isAr ? 'الرقم المرجعي' : 'Order ID']: 'ORD-2024-08-10',
      [isAr ? 'التاريخ' : 'Date']: '2024-08-10',
      [isAr ? 'اسم الصنف' : 'Item Name']: isAr ? 'سماعات آبل إيربودز برو 2' : 'Apple AirPods Pro 2',
      [isAr ? 'القسم / الفئة' : 'Category']: isAr ? 'الصوتيات والملحقات' : 'Audio & Accessories',
      [isAr ? 'الفرع / المنطقة' : 'Region']: isAr ? 'جدة' : 'Jeddah',
      [isAr ? 'الكمية المباعة' : 'Sold Qty']: 160,
      [isAr ? 'المخزون الحالي' : 'Current Stock']: 11,
      [isAr ? 'قيمة المبيعات' : 'Revenue']: 160000,
      [isAr ? 'التكلفة' : 'Cost']: 96000,
      [isAr ? 'صافي الربح' : 'Profit']: 64000,
      [isAr ? 'حالة الطلب' : 'Status']: isAr ? 'مكتمل' : 'Completed',
      [isAr ? 'اسم العميل' : 'Client']: isAr ? 'مجموعة السياحة والترفيه' : 'Tourism & Leisure Group',
      [isAr ? 'نسبة الإنجاز' : 'Progress %']: 100,
    },
    {
      [isAr ? 'الرقم المرجعي' : 'Order ID']: 'ORD-2024-08-25',
      [isAr ? 'التاريخ' : 'Date']: '2024-08-25',
      [isAr ? 'اسم الصنف' : 'Item Name']: isAr ? 'جهاز عرض بروجيكتور إبسون' : 'Epson Full HD Projector',
      [isAr ? 'القسم / الفئة' : 'Category']: isAr ? 'معدات المكاتب' : 'Office Equipment',
      [isAr ? 'الفرع / المنطقة' : 'Region']: isAr ? 'الرياض' : 'Riyadh',
      [isAr ? 'الكمية المباعة' : 'Sold Qty']: 9,
      [isAr ? 'المخزون الحالي' : 'Current Stock']: 30,
      [isAr ? 'قيمة المبيعات' : 'Revenue']: 27000,
      [isAr ? 'التكلفة' : 'Cost']: 19800,
      [isAr ? 'صافي الربح' : 'Profit']: 7200,
      [isAr ? 'حالة الطلب' : 'Status']: isAr ? 'قيد التنفيذ' : 'In Progress',
      [isAr ? 'اسم العميل' : 'Client']: isAr ? 'صندوق الاستثمار التقني' : 'Tech Investment Fund',
      [isAr ? 'نسبة الإنجاز' : 'Progress %']: 85,
    }
  ];

  const headers = Object.keys(rows[0]);
  const sheetName = isAr ? 'تقرير المبيعات وموقف الأعمال (8 شهور)' : 'Sales & Business Status (8 Months)';

  return {
    fileName: isAr ? 'تقرير_مبيعات_الأعمال_8_شهور.xlsx' : 'sales_business_8_months.xlsx',
    sheetNames: [sheetName],
    activeSheet: sheetName,
    sheets: {
      [sheetName]: {
        name: sheetName,
        headers,
        rows,
        columns: headers.map((h) => {
          const isNumeric =
            h.includes('مبيعات') ||
            h.includes('Revenue') ||
            h.includes('تكلفة') ||
            h.includes('Cost') ||
            h.includes('ربح') ||
            h.includes('Profit') ||
            h.includes('الكمية') ||
            h.includes('Qty') ||
            h.includes('المخزون') ||
            h.includes('Stock') ||
            h.includes('%');

          const numVals = isNumeric ? rows.map((r) => Number(r[h]) || 0) : [];
          const sum = numVals.reduce((a, b) => a + b, 0);

          return {
            name: h,
            type: isNumeric
              ? 'number'
              : h.includes('تاريخ') || h.includes('Date')
              ? 'date'
              : h.includes('حالة') || h.includes('Status')
              ? 'status'
              : 'string',
            sampleValues: [rows[0][h]],
            uniqueCount: new Set(rows.map((r) => r[h])).size,
            hasNulls: false,
            ...(isNumeric && numVals.length > 0
              ? {
                  min: Math.min(...numVals),
                  max: Math.max(...numVals),
                  sum,
                  avg: sum / numVals.length,
                }
              : {}),
          };
        }),
        rowCount: rows.length,
      }
    },
    fileSize: 32500,
    uploadedAt: new Date(),
  };
};

export const getSampleProjectsData = (lang: 'ar' | 'en'): WorkbookData => {
  const isAr = lang === 'ar';
  const rows = [
    {
      [isAr ? 'اسم المشروع' : 'Project Name']: isAr ? 'تطوير البوابة الرقمية' : 'Digital Portal Development',
      [isAr ? 'مدير المشروع' : 'Project Manager']: isAr ? 'م. سارة أحمد' : 'Eng. Sarah Ahmed',
      [isAr ? 'القسم' : 'Department']: isAr ? 'تقنية المعلومات' : 'IT',
      [isAr ? 'الميزانية المعتمدة' : 'Budget']: 150000,
      [isAr ? 'المصروف الفعلي' : 'Actual Spent']: 95000,
      [isAr ? 'تاريخ البدء' : 'Start Date']: '2024-01-10',
      [isAr ? 'تاريخ التسليم' : 'Due Date']: '2024-06-30',
      [isAr ? 'موقف المشروع' : 'Status']: isAr ? 'قيد التنفيذ' : 'In Progress',
      [isAr ? 'نسبة الإنجاز %' : 'Completion %']: 75,
    },
    {
      [isAr ? 'اسم المشروع' : 'Project Name']: isAr ? 'تطبيق الموبايل للعملاء' : 'Customer Mobile App',
      [isAr ? 'مدير المشروع' : 'Project Manager']: isAr ? 'م. عمر فاروق' : 'Eng. Omar Farooq',
      [isAr ? 'القسم' : 'Department']: isAr ? 'المنتجات الرقمية' : 'Digital Products',
      [isAr ? 'الميزانية المعتمدة' : 'Budget']: 220000,
      [isAr ? 'المصروف الفعلي' : 'Actual Spent']: 210000,
      [isAr ? 'تاريخ البدء' : 'Start Date']: '2023-11-01',
      [isAr ? 'تاريخ التسليم' : 'Due Date']: '2024-04-15',
      [isAr ? 'موقف المشروع' : 'Status']: isAr ? 'مكتمل' : 'Completed',
      [isAr ? 'نسبة الإنجاز %' : 'Completion %']: 100,
    },
    {
      [isAr ? 'اسم المشروع' : 'Project Name']: isAr ? 'تحديث البنية التحتية والشبكات' : 'Infrastructure Upgrade',
      [isAr ? 'مدير المشروع' : 'Project Manager']: isAr ? 'م. خالد المنصور' : 'Eng. Khalid Al-Mansoor',
      [isAr ? 'القسم' : 'Department']: isAr ? 'الشبكات والأمن' : 'Networks & Security',
      [isAr ? 'الميزانية المعتمدة' : 'Budget']: 180000,
      [isAr ? 'المصروف الفعلي' : 'Actual Spent']: 85000,
      [isAr ? 'تاريخ البدء' : 'Start Date']: '2024-02-01',
      [isAr ? 'تاريخ التسليم' : 'Due Date']: '2024-05-30',
      [isAr ? 'موقف المشروع' : 'Status']: isAr ? 'متأخر' : 'Delayed',
      [isAr ? 'نسبة الإنجاز %' : 'Completion %']: 40,
    },
    {
      [isAr ? 'اسم المشروع' : 'Project Name']: isAr ? 'نظام إدارة علاقات العملاء CRM' : 'Enterprise CRM System',
      [isAr ? 'مدير المشروع' : 'Project Manager']: isAr ? 'م. ريم العتيبي' : 'Eng. Reem Al-Otaibi',
      [isAr ? 'القسم' : 'Department']: isAr ? 'المبيعات والتسويق' : 'Sales & Marketing',
      [isAr ? 'الميزانية المعتمدة' : 'Budget']: 310000,
      [isAr ? 'المصروف الفعلي' : 'Actual Spent']: 295000,
      [isAr ? 'تاريخ البدء' : 'Start Date']: '2023-12-15',
      [isAr ? 'تاريخ التسليم' : 'Due Date']: '2024-05-15',
      [isAr ? 'موقف المشروع' : 'Status']: isAr ? 'مكتمل' : 'Completed',
      [isAr ? 'نسبة الإنجاز %' : 'Completion %']: 100,
    },
    {
      [isAr ? 'اسم المشروع' : 'Project Name']: isAr ? 'أتمتة العمليات الإدارية RPA' : 'Operations Automation RPA',
      [isAr ? 'مدير المشروع' : 'Project Manager']: isAr ? 'م. طارق يوسف' : 'Eng. Tariq Yousef',
      [isAr ? 'القسم' : 'Department']: isAr ? 'العمليات والتشغيل' : 'Operations',
      [isAr ? 'الميزانية المعتمدة' : 'Budget']: 90000,
      [isAr ? 'المصروف الفعلي' : 'Actual Spent']: 20000,
      [isAr ? 'تاريخ البدء' : 'Start Date']: '2024-03-01',
      [isAr ? 'تاريخ التسليم' : 'Due Date']: '2024-08-30',
      [isAr ? 'موقف المشروع' : 'Status']: isAr ? 'قيد التنفيذ' : 'In Progress',
      [isAr ? 'نسبة الإنجاز %' : 'Completion %']: 30,
    }
  ];

  const headers = Object.keys(rows[0]);
  const sheetName = isAr ? 'موقف المشاريع التشغيلية' : 'Operations & Projects Status';

  return {
    fileName: isAr ? 'موقف_المشاريع_والاعمال.xlsx' : 'projects_business_status.xlsx',
    sheetNames: [sheetName],
    activeSheet: sheetName,
    sheets: {
      [sheetName]: {
        name: sheetName,
        headers,
        rows,
        columns: headers.map(h => ({
          name: h,
          type: (h.includes('ميزانية') || h.includes('Budget') || h.includes('المصروف') || h.includes('Spent') || h.includes('%')) ? 'number' : (h.includes('تاريخ') || h.includes('Date')) ? 'date' : (h.includes('موقف') || h.includes('Status')) ? 'status' : 'string',
          sampleValues: [rows[0][h]],
          uniqueCount: rows.length,
          hasNulls: false,
        })),
        rowCount: rows.length,
      }
    },
    fileSize: 18200,
    uploadedAt: new Date(),
  };
};
