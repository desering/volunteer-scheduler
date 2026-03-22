"use client";

import {
  DatePicker,
  FieldLabel,
  useField,
  useFormFields,
} from "@payloadcms/ui";
import { addHours } from "date-fns";
import type React from "react";
import { useEffect } from "react";

type DateFieldConfig = {
  label?: string;
  name?: string;
};

type AutoEndDateProps = {
  path: string;
  field?: DateFieldConfig;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
};

export const AutoEndDate: React.FC<AutoEndDateProps> = (
  props: AutoEndDateProps,
) => {
  const { value, setValue } = useField<string | Date>({ path: props.path });

  const { start_date } = useFormFields(
    ([fields]: [Record<string, { value?: string | Date } | undefined>]) => ({
      start_date: fields.start_date?.value,
    }),
  );

  // sets date
  useEffect(() => {
    if (start_date && (!value || new Date(value) <= new Date(start_date))) {
      setValue(addHours(new Date(start_date), 1).toISOString());
    }
  }, [start_date, value, setValue]);

  const currentValue = value ? new Date(value) : undefined;

  // creates new custom component including field
  return (
    <>
      <FieldLabel
        label={props.field?.label || props.field?.name}
        required={props.required}
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
        displayFormat="dd/MM/y HH:mm"
        pickerAppearance="dayAndTime"
        timeFormat="HH:mm"
        timeIntervals={15}
        timeInputLabel="Time"
        id={props.path}
        name={props.path}
        required={props.required}
        disabled={props.disabled}
        readOnly={props.readOnly}
      />
    </>
  );
};

export default AutoEndDate;
