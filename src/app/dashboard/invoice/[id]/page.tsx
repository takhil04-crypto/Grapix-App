import { CONFIG } from 'src/config-global';
import { _invoices } from 'src/_mock/_invoice';
import type { IInvoice } from 'src/types/invoice';

import { InvoiceDetailsView } from 'src/sections/invoice/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Invoice details | Dashboard - ${CONFIG.appName}` };

type Props = {
  params: { id: string };
};

export default async function Page({ params }: Props) {
  const { id } = params;

  let currentInvoice: IInvoice | undefined = undefined;
    try {
      const res = await fetch(`http://localhost:8082/api/invoices/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        currentInvoice = {
          id: String(data.id),
          sent: data.sent ?? 0, // Add this line, adjust mapping as needed
          taxes: Number(data.taxes),
          status: data.status,
          subtotal: Number(data.sub_total),
          discount: Number(data.discount),
          shipping: Number(data.shipping),
          totalAmount: Number(data.total),
          invoiceNumber: data.invoice_id,
          items: data.invoice_details?.items || [],
          invoiceTo: data.invoice_to, // You may need to fetch or map this to an address object
          invoiceFrom: {
            name: '',
            fullAddress: ''
          }, // You need to fetch or provide this
          createDate: data.created_at,
          dueDate: data.updated_at, // Or another field if you have due date
        };
      } else {
        console.error('Failed to fetch invoice:', res.status);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    }

  return <InvoiceDetailsView invoice={currentInvoice} />;
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };

/**
 * [2] Static exports
 * https://nextjs.org/docs/app/building-your-application/deploying/static-exports
 */
export async function generateStaticParams() {
  if (CONFIG.isStaticExport) {
    return _invoices.map((invoice) => ({ id: invoice.id }));
  }
  return [];
}