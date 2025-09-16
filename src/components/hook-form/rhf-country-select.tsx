import type { CountrySelectProps } from 'src/components/country-select';
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { CountrySelect } from 'src/components/country-select';

// ----------------------------------------------------------------------

export function RHFCountrySelect({
  name,
  helperText,
  ...other
}: CountrySelectProps & {
  name: string;
}) {
  const { control, setValue, getValues } = useFormContext();
   useEffect(() => {
    // Set default to 'India' if not already set
    if (!getValues(name)) {
      setValue(name, 'India', { shouldValidate: true });
    }
  }, [name, setValue, getValues]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <CountrySelect
          id={`rhf-country-select-${name}`}
          value={field.value}
          onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
          error={!!error}
          helperText={error?.message ?? helperText}
          {...other}
        />
      )}
    />
  );
}
