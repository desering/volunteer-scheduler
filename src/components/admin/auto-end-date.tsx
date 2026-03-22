"use client";

import {
  DatePicker,
  FieldLabel,
  useField,
  useFormFields,
} from "@payloadcms/ui";
import { addHours } from "date-fns";
import { useEffect } from "react";

type DateAdminConfig = {
  displayFormat?: string;
  pickerAppearance?: "dayOnly" | "dayAndTime";
  timeFormat?: string;
};

type DateFieldConfig = {
  admin?: {
    date?: DateAdminConfig;
  };
  label?: string;
  name?: string;
  required?: boolean;
  type?: "date";
};

type AutoEndDateProps = {
  field: DateFieldConfig;
  path: string;
  permissions?: unknown;
  schemaPath?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
};

export const AutoEndDate = (
  props: AutoEndDateProps,
) => {
  const { value, setValue } = useField<string | Date>({ path: props.path });

  const { start_date } = useFormFields(
    ([fields]: [Record<string, { value?: string | Date } | undefined>]) => ({
      start_date: fields.start_date?.value,
    }),
  );

  useEffect(() => {
    if (start_date && (!value || new Date(value) <= new Date(start_date))) {
      setValue(addHours(new Date(start_date), 1).toISOString());
    }
  }, [start_date, value, setValue]);

  const currentValue = value ? new Date(value) : undefined;
  const dateAdminConfig = props.field.admin?.date;
  const label = props.field.label ?? props.field.name;
  const isRequired = props.field.required ?? props.required;
  const pickerAppearance = dateAdminConfig?.pickerAppearance ?? "dayAndTime";
  const displayFormat = dateAdminConfig?.displayFormat ?? "dd/MM/y HH:mm";
  const timeFormat = dateAdminConfig?.timeFormat ?? "HH:mm";

  return (
    <>
      <FieldLabel
        label={label}
        required={isRequired}
        htmlFor={props.path}
        path={props.path}
      />

      <DatePicker
        value={currentValue}
        onChange={(nextValue: Date | string | null | undefined) => {
          if (!nextValue) {
            setValue("");
            return;
          }

          setValue(new Date(nextValue).toISOString());
        }}
        displayFormat={displayFormat}
        pickerAppearance={pickerAppearance}
        timeFormat={timeFormat}
        timeIntervals={15}
        timeInputLabel="Time"
        id={props.path}
        name={props.path}
        required={isRequired}
        disabled={props.disabled}
        readOnly={props.readOnly}
      />
    </>
  );
};

export default AutoEndDate;
