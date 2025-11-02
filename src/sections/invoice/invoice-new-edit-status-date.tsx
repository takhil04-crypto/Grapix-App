import { useEffect, useState } from 'react';
import type { IInvoice } from 'src/types/invoice';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';

import { Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type Props = {
  currentInvoice?: IInvoice;
};

export function InvoiceNewEditStatusDate({ currentInvoice }: Props) {
  const { setValue, watch } = useFormContext();
  const values = watch();
  useEffect(() => {
    async function fetchNextInvoiceNumber() {
        try {
          const res = await fetch('/api/invoices/next-id');
          const data = await res.json();
          setValue('invoiceNumber', data.nextInvoiceId);
        } catch (err) {
          setValue('invoiceNumber', 'INV-1001');
        }
      }
    if (!currentInvoice?.id) {
      fetchNextInvoiceNumber();
    }
  }, [setValue, currentInvoice]);

  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ p: 3, bgcolor: 'background.neutral' }}
    >
      <Field.Text
        disabled
        name="invoiceNumber"
        label="Invoice number"
        value={values.invoiceNumber}
      />

      <Field.Select fullWidth name="status" label="Status" InputLabelProps={{ shrink: true }}>
        {['paid', 'pending', 'overdue', 'draft'].map((option) => (
          <MenuItem key={option} value={option} sx={{ textTransform: 'capitalize' }}>
            {option}
          </MenuItem>
        ))}
      </Field.Select>

      <Field.DatePicker name="createDate" label="Date create" />
      <Field.DatePicker name="dueDate" label="Due date" />
    </Stack>
  );
}
