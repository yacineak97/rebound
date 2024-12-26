import { Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import { FormInputProps } from './FormInputProps';

export const FormInputText = ({
  name,
  control,
  label,
  setValue,
  ...rest
}: FormInputProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error }, formState }) => (
        <TextField
          {...field}
          error={!!error}
          helperText={error ? error.message : null}
          label={label}
          {...rest}
        />
      )}
    />
  );
};
