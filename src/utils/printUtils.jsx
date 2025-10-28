// src/utils/printUtils.js
export const printElement = (elementRef) => {
  const printContent = elementRef.current;
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <style>
          @page { size: 1cm 1cm; margin: 0; }
          body { 
            margin: 0; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
          }
        </style>
      </head>
      <body>${printContent.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};
