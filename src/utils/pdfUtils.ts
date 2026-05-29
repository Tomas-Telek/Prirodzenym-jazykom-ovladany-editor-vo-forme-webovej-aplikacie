import { jsPDF } from "jspdf";
export function exportToPDF(paragraphs: string[]): void {
  const doc = new jsPDF();
  

  const removeDiacritics = (text: string) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  let yPosition = 35;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = 170;
  const lineHeight = 7;

  paragraphs.forEach((para) => {
    
    const cleanText = removeDiacritics(para);
    
    const lines: string[] = doc.splitTextToSize(cleanText, contentWidth);

    lines.forEach((line) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    yPosition += 5;
  });

  doc.save("dokument.pdf");
}