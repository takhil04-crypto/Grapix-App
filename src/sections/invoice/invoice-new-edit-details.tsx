import type { IInvoiceItem } from 'src/types/invoice';

import { useEffect, useCallback, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { inputBaseClasses } from '@mui/material/InputBase';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { Controller } from 'react-hook-form';
import { fCurrency } from 'src/utils/format-number';

import { INVOICE_SERVICE_OPTIONS } from 'src/_mock';

import { Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  products: {
    id: number;
    product_name: string;
    properties?: any;
    pricing?: any;
    sub_description?: string;
  }[];
  loadingProducts: boolean;
};

export function InvoiceNewEditDetails({ products, loadingProducts }: Props) {
  const { control, setValue, watch } = useFormContext();

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const values = watch();

  const totalOnRow: number[] = values.items.map((item: IInvoiceItem) => item.quantity * item.price);

  const subtotal = totalOnRow.reduce((acc, num) => acc + num, 0);

  const taxAmount = ((subtotal - values.discount + values.shipping) * (values.taxes || 0)) / 100;

  const totalAmount = subtotal - values.discount - values.shipping + taxAmount;

  useEffect(() => {
    setValue('totalAmount', totalAmount);
  }, [setValue, totalAmount]);

  const handleAdd = () => {
    append({
      title: '',
      description: '',
      service: '',
      quantity: 1,
      price: 0,
      total: 0,
    });
  };

  const handleRemove = (index: number) => {
    remove(index);
  };

  const handleClearService = useCallback(
    (index: number) => {
      setValue(`items[${index}].quantity`, 1);
      setValue(`items[${index}].price`, 0);
      setValue(`items[${index}].total`, 0);
    },
    [setValue]
  );

  const handleSelectService = useCallback(
    (index: number, option: string) => {
      setValue(
        `items[${index}].price`,
        INVOICE_SERVICE_OPTIONS.find((service) => service.name === option)?.price
      );
      setValue(
        `items[${index}].total`,
        values.items.map((item: IInvoiceItem) => item.quantity * item.price)[index]
      );
    },
    [setValue, values.items]
  );

  const handleChangeQuantity = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
      setValue(`items[${index}].quantity`, Number(event.target.value));
      setValue(
        `items[${index}].total`,
        values.items.map((item: IInvoiceItem) => item.quantity * item.price)[index]
      );
    },
    [setValue, values.items]
  );

  const handleChangePrice = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
      setValue(`items[${index}].price`, Number(event.target.value));
      setValue(
        `items[${index}].total`,
        values.items.map((item: IInvoiceItem) => item.quantity * item.price)[index]
      );
    },
    [setValue, values.items]
  );

  const renderTotal = (
    <Stack
      spacing={2}
      alignItems="flex-end"
      sx={{ mt: 3, textAlign: 'right', typography: 'body2' }}
    >
      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Subtotal</Box>
        <Box sx={{ width: 160, typography: 'subtitle2' }}>{fCurrency(subtotal) || '-'}</Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Shipping</Box>
        <Box sx={{ width: 160, ...(values.shipping && { color: 'error.main' }) }}>
          {values.shipping ? `- ${fCurrency(values.shipping)}` : '-'}
        </Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Discount</Box>
        <Box sx={{ width: 160, ...(values.discount && { color: 'error.main' }) }}>
          {values.discount ? `- ${fCurrency(values.discount)}` : '-'}
        </Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Taxes</Box>
        <Box sx={{ width: 160 }}>{values.taxes ? fCurrency(taxAmount) : '-'}</Box>
      </Stack>

      <Stack direction="row" sx={{ typography: 'subtitle1' }}>
        <div>Total</div>
        <Box sx={{ width: 160 }}>{fCurrency(totalAmount) || '-'}</Box>
      </Stack>
    </Stack>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ color: 'text.disabled', mb: 3 }}>
        Details:
      </Typography>

      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {fields.map((item, index) => {
          const selectedProduct = products.find((p) => p.product_name === values.items[index].title);
          const stockQty = Number(selectedProduct?.properties?.quantity ?? 0);
          let stockStatus = '';
          if (selectedProduct) {
            if (stockQty === 0) stockStatus = 'Out of stock';
            else if (stockQty <= 2) stockStatus = 'Low stock';
            else stockStatus = `In stock: ${stockQty}`;
          }
          return (
            <Stack key={item.id} alignItems="flex-end" spacing={1.5}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
              <Controller
                name={`items[${index}].title`}
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    freeSolo
                    options={products}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.product_name || '')}
                    loading={loadingProducts}
                    value={
                      products.find((p) => p.product_name === field.value) || field.value || null
                    }
                    onInputChange={(event, newInputValue) => {
                      field.onChange(newInputValue);
                    }}
                    onChange={(_, newValue) => {
                      if (typeof newValue === 'string') {
                         // User typed a custom value and pressed enter (or via input change)
                         field.onChange(newValue);
                         // Reset other fields if needed, but careful not to wipe if just typing
                         if (!products.find(p => p.product_name === newValue)) {
                           setValue(`items[${index}].quantity`, 1); 
                           setValue(`items[${index}].price`, 0);
                           setValue(`items[${index}].total`, 0);
                           setValue(`items[${index}].description`, '');
                         }
                      } else if (newValue && typeof newValue === 'object') {
                        // User selected an existing item
                        field.onChange(newValue.product_name);
                        
                        const qty = Number(newValue?.properties?.quantity) === 0 ? 0 : 1;
                        setValue(`items[${index}].quantity`, qty);
                        setValue(`items[${index}].description`, newValue?.sub_description || '');
                        setValue(`items[${index}].price`, Number(newValue?.pricing?.priceSale) || 0);
                        setValue(
                          `items[${index}].total`,
                          qty * (Number(newValue?.pricing?.priceSale) || 0)
                        );
                      } else {
                        // Cleared
                        field.onChange('');
                        setValue(`items[${index}].quantity`, 0);
                        setValue(`items[${index}].price`, 0);
                        setValue(`items[${index}].total`, 0);
                        setValue(`items[${index}].description`, '');
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Product"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingProducts ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    isOptionEqualToValue={(option, value) => {
                      if (typeof value === 'string') return option.product_name === value;
                      return option.id === value?.id;
                    }}
                    sx={{ minWidth: 300, maxWidth: 400 }} 
                  />
                )}
              />

              <Field.Text
                size="small"
                name={`items[${index}].description`}
                label="Description"
                InputLabelProps={{ shrink: true }}
              />
{/* 
              <Field.Select
                name={`items[${index}].service`}
                size="small"
                label="Service"
                InputLabelProps={{ shrink: true }}
                sx={{ maxWidth: { md: 160 } }}
              >
                <MenuItem
                  value=""
                  onClick={() => handleClearService(index)}
                  sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                >
                  None
                </MenuItem>

                <Divider sx={{ borderStyle: 'dashed' }} />

                {INVOICE_SERVICE_OPTIONS.map((service) => (
                  <MenuItem
                    key={service.id}
                    value={service.name}
                    onClick={() => handleSelectService(index, service.name)}
                  >
                    {service.name}
                  </MenuItem>
                ))}
              </Field.Select> */}

              <Field.Text
                size="small"
                type="number"
                name={`items[${index}].quantity`}
                label="Quantity"
                placeholder="0"
                onChange={(event) => handleChangeQuantity(event, index)}
                InputLabelProps={{ shrink: true }}
                sx={{ maxWidth: { md: 96 } }}
                disabled={selectedProduct && Number(selectedProduct?.properties?.quantity) === 0}
              />
              {selectedProduct && (
                <Typography
                  variant="caption"
                  color={
                    stockQty === 0
                      ? 'error.main'
                      : stockQty <= 2
                      ? 'warning.main'
                      : 'success.main'
                  }
                  sx={{ ml: 1 }}
                >
                  {stockStatus}
                </Typography>
              )}
              <Field.Text
                size="small"
                type="number"
                name={`items[${index}].price`}
                label="Price"
                placeholder="0.00"
                onChange={(event) => handleChangePrice(event, index)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box sx={{ typography: 'subtitle2', color: 'text.disabled' }}>₹</Box>
                    </InputAdornment>
                  ),
                }}
                sx={{ maxWidth: { md: 96 } }}
              />

              <Field.Text
                disabled
                size="small"
                type="number"
                name={`items[${index}].total`}
                label="Total"
                placeholder="0.00"
                value={values.items[index].total === 0 ? '' : values.items[index].total.toFixed(2)}
                onChange={(event) => handleChangePrice(event, index)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                        <Box sx={{ typography: 'subtitle2', color: 'text.disabled' }}>₹</Box>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  maxWidth: { md: 104 },
                  [`& .${inputBaseClasses.input}`]: { textAlign: { md: 'right' } },
                }}
              />
            </Stack>

            <Button
              size="small"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={() => handleRemove(index)}
            >
              Remove
            </Button>
          </Stack>
        )})}
      </Stack>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

      <Stack
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-end', md: 'center' }}
      >
        <Button
          size="small"
          color="primary"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleAdd}
          sx={{ flexShrink: 0 }}
        >
          Add Item
        </Button>

        <Stack
          spacing={2}
          justifyContent="flex-end"
          direction={{ xs: 'column', md: 'row' }}
          sx={{ width: 1 }}
        >
          <Field.Text
            size="small"
            label="Shipping(₹)"
            name="shipping"
            type="number"
            sx={{ maxWidth: { md: 120 } }}
          />

          <Field.Text
            size="small"
            label="Discount(₹)"
            name="discount"
            type="number"
            sx={{ maxWidth: { md: 120 } }}
          />

          <Field.Text
            size="small"
            label="Taxes(%)"
            name="taxes"
            type="number"
            sx={{ maxWidth: { md: 120 } }}
          />
        </Stack>
      </Stack>

      {renderTotal}
    </Box>
  );
}
