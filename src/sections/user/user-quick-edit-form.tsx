import type { IUserItem } from 'src/types/user';

import { z as zod } from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useRouter } from 'src/routes/hooks';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { paths } from 'src/routes/paths';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

// import { USER_STATUS_OPTIONS } from 'src/_mock';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type UserQuickEditSchemaType = zod.infer<typeof UserQuickEditSchema>;

export const UserQuickEditSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  email: zod.string().optional(),
  phoneNumber: schemaHelper.phoneNumber({ isValidPhoneNumber }),
  country: zod.any().nullable(),
  address1: zod.string().optional(),
  address2: zod.string().optional(),
  state: zod.string().optional(),
  city: zod.string().optional(),
  zipCode: zod.string().optional(),
  // company: zod.string().min(1, { message: 'Company is required!' }),
  // role: zod.string().min(1, { message: 'Role is required!' }),
  // Not required
  status: zod.string(),
});

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  currentUser?: IUserItem;
};

export function UserQuickEditForm({ currentUser, open, onClose }: Props) {
  const router = useRouter();
  const STATUS_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    // { value: 'pending', label: 'Pending' },
    { value: 'deleted', label: 'Deleted' },
    // { value: 'rejected', label: 'Rejected' },
  ];
  const defaultValues = useMemo(
    () => ({
      id: currentUser?.id || '',
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phoneNumber: currentUser?.phoneNumber || '',
      country: currentUser?.country || '',
      state: currentUser?.state || '',
      city: currentUser?.city || '',
      address1: currentUser?.address1 || '',
      zipCode: currentUser?.zip || '',
      address2: currentUser?.address2 || '',
      status: currentUser?.status,
      company: currentUser?.company || '',
      // role: currentUser?.role || '',
    }),
    [currentUser]
  );

  const methods = useForm<UserQuickEditSchemaType>({
    mode: 'all',
    resolver: zodResolver(UserQuickEditSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    console.log('Form Data Submitted:', data);
      const payload = {
      id: currentUser?.id,
      name: data.name,
      email: data.email,
      phone: data.phoneNumber,
      country: typeof data.country === 'string'
        ? data.country
        : (data.country && 'label' in data.country ? data.country.label : ''),
      state: data.state,
      city: data.city,
      address1: data.address1,
      address2: data.address2,
      zip: data.zipCode,
      status: 'active',
    };

    try {
      const isEdit = Boolean(currentUser?.id);
      const response = await fetch('http://localhost:8082/api/customers', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update customer');
      }

      reset();
      onClose();

      toast.success('Customer updated successfully!');
      router.push(paths.dashboard.user.list);
      // Optionally log response
      const result = await response.json();
      console.info('API response:', result);
    } catch (error) {
      toast.error('Failed to update customer!');
      console.error(error);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { maxWidth: 720 } }}
    >
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Quick Update</DialogTitle>

        <DialogContent>
          {/* <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
            Account is waiting for confirmation
          </Alert> */}

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            <Field.Select name="status" label="Status" sx={{ marginTop: 2}}>
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

            <Field.Text name="name" label="Full name" />
            <Field.Text name="email" label="Email address" />
            <Field.Phone name="phoneNumber" label="Phone number" />

            <Field.CountrySelect
              fullWidth
              name="country"
              label="Country"
              placeholder="Choose a country"
            />

            <Field.Text name="state" label="State/region" />
            <Field.Text name="city" label="City" />
            <Field.Text name="address1" label="Address Line1" />
            <Field.Text name="address2" label="Address Line2" />
            <Field.Text name="zipCode" label="Zip/code" />
            {/* <Field.Text name="company" label="Company" />
            <Field.Text name="role" label="Role" /> */}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Update
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
