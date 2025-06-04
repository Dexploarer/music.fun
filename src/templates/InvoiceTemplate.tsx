import React from 'react';

interface InvoiceTemplateProps {
  venueName?: string;
  venueAddress?: string;
  venuePhone?: string;
  venueEmail?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  clientName?: string;
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
  items?: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  total?: number;
  notes?: string;
  paymentTerms?: string;
  paymentInstructions?: string;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  venueName = 'The Train Station',
  venueAddress = '4671 5th Street, Corbin, KY 40701',
  venuePhone = '(606) 555-1234',
  venueEmail = 'contact@thetrainstation.com',
  invoiceNumber = '[INVOICE NUMBER]',
  invoiceDate = '[INVOICE DATE]',
  dueDate = '[DUE DATE]',
  clientName = '[CLIENT NAME]',
  clientAddress = '[CLIENT ADDRESS]',
  clientEmail = '[CLIENT EMAIL]',
  clientPhone = '[CLIENT PHONE]',
  items = [
    { description: '[ITEM DESCRIPTION]', quantity: 1, rate: 0, amount: 0 }
  ],
  subtotal = 0,
  taxRate = 6,
  taxAmount = 0,
  total = 0,
  notes = '[NOTES]',
  paymentTerms = 'Net 30',
  paymentInstructions = 'Please make checks payable to The Train Station or pay by bank transfer to the account details below.'
}) => {
  const invoiceText = `
INVOICE

${venueName}
${venueAddress}
Phone: ${venuePhone}
Email: ${venueEmail}

BILL TO:
${clientName}
${clientAddress}
Phone: ${clientPhone}
Email: ${clientEmail}

INVOICE DETAILS:
Invoice Number: ${invoiceNumber}
Invoice Date: ${invoiceDate}
Due Date: ${dueDate}
Payment Terms: ${paymentTerms}

---------------------------------------------------------------------------
DESCRIPTION                 QUANTITY    RATE         AMOUNT
---------------------------------------------------------------------------
${items.map(item => 
  `${item.description.padEnd(28)}${item.quantity.toString().padEnd(12)}$${item.rate.toFixed(2).padEnd(13)}$${item.amount.toFixed(2)}`
).join('\n')}
---------------------------------------------------------------------------

SUBTOTAL: $${subtotal.toFixed(2)}
TAX (${taxRate}%): $${taxAmount.toFixed(2)}
TOTAL DUE: $${total.toFixed(2)}

PAYMENT INSTRUCTIONS:
${paymentInstructions}

NOTES:
${notes}

Thank you for your business!

BANK DETAILS:
Bank Name: [BANK NAME]
Account Name: The Train Station
Account Number: [ACCOUNT NUMBER]
Routing Number: [ROUTING NUMBER]

TERMS AND CONDITIONS:
1. Payment is due according to the terms listed above.
2. Late payments may be subject to a late fee of 1.5% per month.
3. Please include the invoice number with your payment.
`;

  return invoiceText;
};

export default InvoiceTemplate;