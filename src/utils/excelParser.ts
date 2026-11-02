import * as XLSX from 'xlsx';
import { ColumnDataType, ColumnInfo, SheetData, WorkbookData } from '../types';

/**
 * Universal date parser that handles:
 * - JavaScript Date objects
 * - Excel serial date numbers (e.g. 45321)
 * - ISO strings (2024-01-15)
 * - Slash/dash formats (15/01/2024, 01/15/2024, 15-01-2024)
 * - Month text names in English and Arabic
 */
export const parseDateValue = (val: any): Date | null => {
  if (val === null || val === undefined || val === '') return null;

  if (val instanceof Date && !isNaN(val.getTime())) {
    return val;
  }

  // Handle Excel serial date numbers
  if (typeof val === 'number') {
    if (val > 20000 && val < 65000) {
      // Excel epoch starts at Dec 30, 1899
      const utcDays = val - 25569;
      const utcValue = utcDays * 86400;
      const dateInfo = new Date(utcValue * 1000);
      if (!isNaN(dateInfo.getTime())) return dateInfo;
    }
    return null;
  }

  const str = String(val).trim();
  if (!str) return null;

  // Try standard Date.parse
  const directParse = Date.parse(str);
  if (!isNaN(directParse)) {
    return new Date(directParse);
  }

  // Try DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/);
  if (dmyMatch) {
    const p1 = parseInt(dmyMatch[1], 10);
    const p2 = parseInt(dmyMatch[2], 10);
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) year += 2000;

    // Check if DD/MM/YYYY
    if (p1 <= 31 && p2 <= 12) {
      const d = new Date(year, p2 - 1, p1);
      if (!isNaN(d.getTime())) return d;
    }
    // Check if MM/DD/YYYY
    if (p2 <= 31 && p1 <= 12) {
      const d = new Date(year, p1 - 1, p2);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // Try YYYY/MM/DD or YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month - 1, day);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
};

export const parseExcelFile = async (file: File): Promise<WorkbookData> => {
  const data = await file.arrayBuffer();
  let workbook: XLSX.WorkBook;

  try {
    workbook = XLSX.read(data, {
      type: 'array',
      cellDates: true,
      cellNF: true,
      cellText: true,
    });
  } catch (e) {
    const binaryStr = await file.text();
    workbook = XLSX.read(binaryStr, { type: 'binary', cellDates: true });
  }

  const sheetNames = workbook.SheetNames || [];
  if (sheetNames.length === 0) {
    throw new Error('الملف فارغ ولا يحتوي على أي أوراق عمل (Sheets).');
  }

  const sheets: Record<string, SheetData> = {};

  sheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) return;

    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: null,
      raw: false,
      dateNF: 'yyyy-mm-dd',
    });

    if (!rawRows || rawRows.length === 0) {
      sheets[sheetName] = {
        name: sheetName,
        headers: [],
        rows: [],
        columns: [],
        rowCount: 0,
      };
      return;
    }

    const validRows = rawRows.filter((row) =>
      Object.values(row).some((v) => v !== null && v !== undefined && String(v).trim() !== '')
    );

    if (validRows.length === 0) {
      sheets[sheetName] = {
        name: sheetName,
        headers: [],
        rows: [],
        columns: [],
        rowCount: 0,
      };
      return;
    }

    const rawHeaders = Object.keys(validRows[0] || {});
    const headers = rawHeaders.map((h, i) => (h && h.trim() !== '' ? h.trim() : `Column_${i + 1}`));
    const columns = analyzeColumns(headers, validRows);

    sheets[sheetName] = {
      name: sheetName,
      headers,
      rows: validRows,
      columns,
      rowCount: validRows.length,
    };
  });

  const availableSheets = Object.keys(sheets);
  const initialActiveSheet = availableSheets.find((s) => sheets[s].rowCount > 0) || availableSheets[0] || '';

  return {
    fileName: file.name,
    sheetNames: availableSheets,
    activeSheet: initialActiveSheet,
    sheets,
    fileSize: file.size,
    uploadedAt: new Date(),
  };
};

const analyzeColumns = (headers: string[], rows: Record<string, any>[]): ColumnInfo[] => {
  return headers.map((header) => {
    const values = rows.map((r) => r[header]).filter((v) => v !== null && v !== undefined && v !== '');
    const uniqueValues = new Set(values);
    const hasNulls = values.length < rows.length;

    const detectedType = detectColumnType(header, values);

    const colInfo: ColumnInfo = {
      name: header,
      type: detectedType,
      sampleValues: values.slice(0, 5),
      uniqueCount: uniqueValues.size,
      hasNulls,
    };

    if (detectedType === 'number') {
      const numVals = values
        .map((v) => (typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.-]+/g, ''))))
        .filter((n) => !isNaN(n) && isFinite(n));

      if (numVals.length > 0) {
        colInfo.min = Math.min(...numVals);
        colInfo.max = Math.max(...numVals);
        colInfo.sum = numVals.reduce((acc, curr) => acc + curr, 0);
        colInfo.avg = colInfo.sum / numVals.length;
      }
    }

    return colInfo;
  });
};

const detectColumnType = (headerName: string, values: any[]): ColumnDataType => {
  const headerLower = headerName.toLowerCase().trim();

  // Status keywords in Arabic and English
  const statusKeywords = [
    'status', 'state', 'حالة', 'موقف', 'الحالة', 'الموقف', 'مرحلة', 'progress', 'stage',
    'condition', 'وضع', 'الوضع'
  ];
  if (statusKeywords.some((k) => headerLower.includes(k))) {
    return 'status';
  }

  // Date keywords
  const dateKeywords = [
    'date', 'time', 'تاريخ', 'التاريخ', 'الوقت', 'period', 'created', 'updated', 'month', 'year',
    'يوم', 'شهر', 'سنة', 'فترة', 'الفترة', 'timestamp', 'day'
  ];
  if (dateKeywords.some((k) => headerLower.includes(k))) {
    return 'date';
  }

  if (values.length === 0) return 'string';

  let numCount = 0;
  let dateCount = 0;
  let boolCount = 0;

  const sample = values.slice(0, 50);

  sample.forEach((val) => {
    if (val instanceof Date) {
      dateCount++;
      return;
    }

    if (typeof val === 'boolean') {
      boolCount++;
      return;
    }

    // Try date parse
    const parsedDate = parseDateValue(val);
    if (parsedDate !== null) {
      dateCount++;
      return;
    }

    if (typeof val === 'number') {
      numCount++;
      return;
    }

    const str = String(val).trim();
    const cleanedNum = str.replace(/[$€£¥,%\s]/g, '');
    if (!isNaN(Number(cleanedNum)) && cleanedNum !== '') {
      numCount++;
      return;
    }
  });

  const threshold = sample.length * 0.5;

  if (dateCount >= threshold) return 'date';
  if (numCount >= threshold) return 'number';
  if (boolCount >= threshold) return 'boolean';

  return 'string';
};
