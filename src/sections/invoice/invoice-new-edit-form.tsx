import type { IInvoice } from 'src/types/invoice';

import { z as zod } from 'zod';
import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { today, fIsAfter } from 'src/utils/format-time';

import { _addressBooks } from 'src/_mock';

import { Form, schemaHelper } from 'src/components/hook-form';

import { InvoiceNewEditDetails } from './invoice-new-edit-details';
import { InvoiceNewEditAddress } from './invoice-new-edit-address';
import { InvoiceNewEditStatusDate } from './invoice-new-edit-status-date';

// ----------------------------------------------------------------------

export type NewInvoiceSchemaType = zod.infer<typeof NewInvoiceSchema>;

export const NewInvoiceSchema = zod
  .object({
    invoiceTo: schemaHelper.objectOrNull<IInvoice['invoiceTo'] | null>({
      message: { required_error: 'Invoice to is required!' },
    }),
    createDate: schemaHelper.date({ message: { required_error: 'Create date is required!' } }),
    dueDate: zod.any().nullable(),
    items: zod.array(
      zod.object({
        title: zod.string(),
        // service: zod.string().min(1, { message: 'Service is required!' }),
        quantity: zod.coerce.number().min(1, { message: 'Quantity must be more than 0' }),
        // Not required
        price: zod.coerce.number(),
        total: zod.coerce.number(),
        description: zod.string(),
      })
    ),
    // Not required
    taxes: zod.coerce.number(),
    status: zod.string(),
    discount: zod.coerce.number(),
    shipping: zod.coerce.number(),
    totalAmount: zod.coerce.number(),
    invoiceNumber: zod.string(),
    invoiceFrom: zod.custom<IInvoice['invoiceFrom']>().nullable(),
  })
  .refine((data) => !data.dueDate || !fIsAfter(data.createDate, data.dueDate), {
    message: 'Due date cannot be earlier than create date!',
    path: ['dueDate'],
  });

// ----------------------------------------------------------------------

const mapFormToApiPayload = (data: NewInvoiceSchemaType) => ({
  invoice_id: data.invoiceNumber,
  status: data.status,
  invoice_to: {
    name: data.invoiceTo?.name || '',
    address1: data.invoiceTo?.address1 || '',
    address2: data.invoiceTo?.address2 || '',
    phoneNumber: data.invoiceTo?.phoneNumber || '',
  },
  invoice_details: {
    items: data.items.map((item) => ({
      title: item.title,
      description: item.description,
      // service: item.service,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
    })),
  },
  sub_total: data.items.reduce((acc, item) => acc + item.quantity * item.price, 0),
  shipping: data.shipping,
  discount: data.discount,
  taxes: data.taxes,
  total: data.totalAmount,
});

type Props = {
  currentInvoice?: IInvoice;
};

export function InvoiceNewEditForm({ currentInvoice }: Props) {
  const router = useRouter();

  const loadingSave = useBoolean();

  const loadingSend = useBoolean();

  // --- Product fetching state ---
  const [products, setProducts] = useState<{
    id: number;
    product_name: string;
    properties?: any;
    pricing?: any;
    sub_description?: string;
  }[]>([]);
  
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    setLoadingProducts(true);
    fetch('http://localhost:8082/api/products?limit=1000')
      .then((res) => {
          if (!res.ok) throw new Error(res.statusText);
          return res.json();
      })
      .then((data) => {
          if (Array.isArray(data)) {
             setProducts(data);
          } else {
             console.error("Products API returned non-array:", data);
             setProducts([]);
          }
      })
      .catch((err) => {
          console.error("Failed to fetch products:", err);
          setProducts([]); 
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  const createNewProduct = async (productName: string, price: number, description: string) => {
    try {
      console.log('Creating new product:', productName);
      const payload = {
         product_name: productName,
         properties: { quantity: 100 },
         pricing: { priceSale: price },
         sub_description: description || '',
         content: '',
         images: [],
         publish_status: 'published'
      };
      
      console.log('Sending payload:', payload);

      const response = await fetch('http://localhost:8082/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
         const errorText = await response.text();
         console.error('Data error:', errorText);
         throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const newProduct = await response.json();
      console.log('Product created successfully:', newProduct);
      return newProduct;
    } catch (error) {
       console.error("Failed to create product:", error);
       return null;
    }
  };

  const ensureCustomProductsExist = async (invoiceItems: any[]) => {
    try {
      await Promise.all(invoiceItems.map(async (item) => {
        if (!item.title) return;
        
        const exists = Array.isArray(products) ? products.find(p => p.product_name === item.title) : undefined;
        
        if (!exists) {
          // Create new product
          const newProduct = await createNewProduct(item.title, item.price, item.description);
          if (newProduct) {
             setProducts(prev => [...(Array.isArray(prev) ? prev : []), newProduct]);
          }
        }
      }));
    } catch (error) {
      console.error("Error creating custom products:", error);
    }
  };

  const defaultValues = useMemo(
    () => ({
      invoiceNumber: currentInvoice?.invoiceNumber || 'INV-1',
      createDate: currentInvoice?.createDate || today(),
      dueDate: currentInvoice?.dueDate || null,
      taxes: currentInvoice?.taxes || 0,
      shipping: currentInvoice?.shipping || 0,
      status: currentInvoice?.status || 'draft',
      discount: currentInvoice?.discount || 0,
      invoiceFrom: currentInvoice?.invoiceFrom || _addressBooks[0],
      invoiceTo: currentInvoice?.invoiceTo || null,
      totalAmount: currentInvoice?.totalAmount || 0,
      items: currentInvoice?.items || [
        {
          title: '',
          description: '',
          // service: '',
          quantity: 1,
          price: 0,
          total: 0,
        },
      ],
    }),
    [currentInvoice]
  );

  const methods = useForm<NewInvoiceSchemaType>({
    mode: 'all',
    resolver: zodResolver(NewInvoiceSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onError = (errors: any) => {
    console.error("Form Validation Errors:", errors);
    const errorMessages = Object.values(errors).map((e: any) => e.message).join('\n');
    alert(`Please fix the following errors:\n${errorMessages}`);
  };

  const handleSaveAsDraft = handleSubmit(async (data) => {
    loadingSave.onTrue();
    try {
      await ensureCustomProductsExist(data.items);

      const isEdit = !!currentInvoice;
      const payload = {
        ...(isEdit ? { id: currentInvoice.id } : {}),
        ...mapFormToApiPayload({ ...data, status: 'draft' }),
      };
      const url = 'http://localhost:8082/api/invoices';
      const method = isEdit ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
         const errText = await response.text();
         throw new Error(errText);
      }

      reset();
      loadingSave.onFalse();
      router.push(paths.dashboard.invoice.root);
    } catch (error) {
      console.error("Save Draft Error:", error);
      // alert(`Failed to save invoice: ${error.message}`);
      loadingSave.onFalse();
    }
  }, onError);

  const handleCreateAndSend = handleSubmit(async (data) => {
    console.log('handleCreateAndSend data',data);
    loadingSend.onTrue();
    try {
      await ensureCustomProductsExist(data.items);

      const isEdit = !!currentInvoice;
      const payload = {
        ...(isEdit ? { id: currentInvoice.id } : {}),
        ...mapFormToApiPayload({ ...data, status: 'paid' }),
      };
      
      console.log('Sending invoice payload:', payload);

      const url = 'http://localhost:8082/api/invoices';
      const method = isEdit ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
         const errText = await response.text();
         throw new Error(errText);
      }
      
      console.log('Invoice created successfully');
      reset();
      loadingSend.onFalse();
      router.push(paths.dashboard.invoice.root);
    } catch (error) {
      console.error("Create Send Error:", error);
      alert(`Failed to create invoice: ${error.message}`);
      loadingSend.onFalse();
    }
  }, onError);

  return (
    <Form methods={methods}>
      <Card>
        <InvoiceNewEditAddress />

        <InvoiceNewEditStatusDate currentInvoice={currentInvoice} />

        <InvoiceNewEditDetails products={products} loadingProducts={loadingProducts} />
      </Card>

      <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3 }}>
        <LoadingButton
          color="inherit"
          size="large"
          variant="outlined"
          loading={loadingSave.value && isSubmitting}
          onClick={handleSaveAsDraft}
        >
          Save as draft
        </LoadingButton>

        <LoadingButton
          size="large"
          variant="contained"
          loading={loadingSend.value && isSubmitting}
          onClick={handleCreateAndSend} // Pass onError here if possible, but handleSubmit wraps it.
          // The onClick should be the result of handleSubmit(valid, invalid)
        >
          {currentInvoice ? 'Update' : 'Create'} & send
        </LoadingButton>
      </Stack>
    </Form>
  );
}
