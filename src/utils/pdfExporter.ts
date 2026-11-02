import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportDashboardToPdf = async (
  elementId: string,
  fileName: string = 'business_analytics_report.pdf'
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id #${elementId} not found.`);
  }

  // Temporary styling for PDF snapshot
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1440,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  let heightLeft = pdfHeight;
  let position = 0;
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
};

export const exportTableToCsv = (
  headers: string[],
  rows: Record<string, any>[],
  fileName: string = 'data_export.csv'
): void => {
  const csvRows: string[] = [];
  
  // Add UTF-8 BOM for Excel Arabic compatibility
  const BOM = '\uFEFF';
  
  csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

  rows.forEach((row) => {
    const values = headers.map((header) => {
      const val = row[header] ?? '';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  });

  const blob = new Blob([BOM + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
