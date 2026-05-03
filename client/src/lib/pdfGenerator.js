import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (bill) => {
  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(24, 128, 56); // GrowFarm Green
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('GrowFarm', 15, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Empowering Farmers, Enriching Lives', 15, 32);
    
    doc.setFontSize(18);
    doc.text('TAX INVOICE', 140, 25);
    
    // Invoice Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice No:', 15, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(String(bill.billNo || 'N/A'), 40, 55);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 15, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(bill.transactionDate ? new Date(bill.transactionDate).toLocaleDateString('en-IN') : 'N/A', 40, 62);

    // Addresses
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('From (Seller)', 15, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(bill.farmer?.fullName || 'GrowFarm Farmer', 15, 87);
    doc.setFont('helvetica', 'normal');
    doc.text(`Phone: ${bill.farmer?.phone || 'N/A'}`, 15, 93);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('To (Buyer)', 120, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(bill.trader?.fullName || 'GrowFarm Trader', 120, 87);
    doc.setFont('helvetica', 'normal');
    doc.text(`Phone: ${bill.trader?.phone || 'N/A'}`, 120, 93);

    // Table
    const tableData = [
      [
        { content: `${bill.cropName || 'N/A'}\nGrade: ${bill.grade || 'N/A'}`, styles: { fontStyle: 'bold' } },
        `${bill.quantity || 0} ${bill.unit || ''}`,
        `INR ${bill.rate?.toLocaleString('en-IN') || 0}`,
        `INR ${bill.netPayable?.toLocaleString('en-IN') || 0}`
      ]
    ];

    autoTable(doc, {
      startY: 110,
      head: [['Item Details', 'Quantity', 'Rate', 'Amount']],
      body: tableData,
      headStyles: { fillColor: [24, 128, 56], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right', fontStyle: 'bold' }
      }
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount Payable:', 120, finalY + 10);
    doc.setFontSize(16);
    doc.setTextColor(24, 128, 56);
    doc.text(`INR ${bill.netPayable?.toLocaleString('en-IN') || 0}`, 120, finalY + 20);

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('This is a computer-generated invoice and does not require a physical signature.', 105, 280, { align: 'center' });
    doc.text('Thank you for being a part of the GrowFarm ecosystem!', 105, 285, { align: 'center' });

    // Save
    doc.save(`Invoice_${bill.billNo || 'bill'}.pdf`);
  } catch (err) {
    console.error('PDF Generation Detail:', err);
    throw err;
  }
};

export const generateLoanPDF = (loan) => {
  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(217, 119, 6); // Amber/Gold
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('GrowFarm Finance', 15, 25);
    
    doc.setFontSize(18);
    doc.text('LOAN SUMMARY', 140, 25);
    
    // Loan Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Loan Information', 15, 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Title:', 15, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(String(loan.title || 'N/A'), 50, 65);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Lender:', 15, 72);
    doc.setFont('helvetica', 'normal');
    doc.text(String(loan.lender || 'N/A'), 50, 72);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Status:', 15, 79);
    doc.setFont('helvetica', 'normal');
    doc.text(String(loan.status || 'N/A').toUpperCase(), 50, 79);

    // Financials Table
    autoTable(doc, {
      startY: 90,
      head: [['Description', 'Value']],
      body: [
        ['Principal Amount', `INR ${loan.principal?.toLocaleString('en-IN') || 0}`],
        ['Interest Rate', `${loan.interestRate || 0}% p.a.`],
        ['Tenure', `${loan.tenure || 0} Months`],
        ['Outstanding Balance', `INR ${loan.outstanding?.toLocaleString('en-IN') || 0}`],
        ['Sanction Date', loan.sanctionDate ? new Date(loan.sanctionDate).toLocaleDateString('en-IN') : 'N/A'],
        ['Maturity Date', loan.maturityDate ? new Date(loan.maturityDate).toLocaleDateString('en-IN') : 'N/A']
      ],
      headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255] },
      theme: 'striped'
    });

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('This is an account summary provided by GrowFarm for informational purposes.', 105, 280, { align: 'center' });
    doc.text('GrowFarm — Financial Empowerment for Farmers', 105, 285, { align: 'center' });

    // Save
    doc.save(`Loan_Summary_${String(loan.title || 'loan').replace(/\s+/g, '_')}.pdf`);
  } catch (err) {
    console.error('PDF Generation Detail:', err);
    throw err;
  }
};

export const generateInsurancePDF = (policy) => {
  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(14, 165, 233); // Sky Blue
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('GrowFarm Insurance', 15, 25);
    
    doc.setFontSize(18);
    doc.text('POLICY CERTIFICATE', 130, 25);
    
    // Policy Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Insurance Policy Details', 15, 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Policy No:', 15, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(String(policy.policyNumber || 'N/A'), 50, 65);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Policy Name:', 15, 72);
    doc.setFont('helvetica', 'normal');
    doc.text(String(policy.policyName || 'N/A'), 50, 72);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Provider:', 15, 79);
    doc.setFont('helvetica', 'normal');
    doc.text(String(policy.provider || 'N/A'), 50, 79);

    // Coverage Table
    autoTable(doc, {
      startY: 90,
      head: [['Coverage Details', 'Information']],
      body: [
        ['Scheme Name', policy.schemeName || 'N/A'],
        ['Season', policy.season || 'N/A'],
        ['Crops Covered', policy.cropsCovered?.join(', ') || 'N/A'],
        ['Land Area', `${policy.landArea || 0} Acres`],
        ['Survey Number', policy.surveyNo || 'N/A'],
        ['Coverage Amount', `INR ${policy.coverageAmount?.toLocaleString('en-IN') || 0}`],
        ['Premium Paid (Farmer)', `INR ${policy.farmerPremium?.toLocaleString('en-IN') || 0}`],
        ['Subsidy Amount', `${policy.subsidyPercentage || 0}%`],
        ['Validity', `${policy.startDate ? new Date(policy.startDate).toLocaleDateString('en-IN') : 'N/A'} to ${policy.endDate ? new Date(policy.endDate).toLocaleDateString('en-IN') : 'N/A'}`]
      ],
      headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255] },
      theme: 'grid'
    });

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('This is a digitally generated insurance certificate issued via the GrowFarm platform.', 105, 280, { align: 'center' });
    doc.text('Contact support@growfarm.com for any verification queries.', 105, 285, { align: 'center' });

    // Save
    doc.save(`Insurance_Policy_${policy.policyNumber || 'policy'}.pdf`);
  } catch (err) {
    console.error('PDF Generation Detail:', err);
    throw err;
  }
};
