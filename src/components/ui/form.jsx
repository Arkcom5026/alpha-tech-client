// ✅ src/components/ui/form.jsx (ปรับให้ wrap FormProvider และ fallback ชัดเจน)

import * as React from "react"
import { useFormContext, Controller, FormProvider } from "react-hook-form"

// ✅ ใช้ FormProvider ครอบอัตโนมัติ
const Form = ({ children, methods, ...props }) => {
  if (!methods || !methods.control) {
    throw new Error("Form: 'methods' (useForm instance) is required.");
  }
  return (
    <FormProvider {...methods}>
      <form {...props}>{children}</form>
    </FormProvider>
  );
};

const FormField = ({ name, render }) => {
  const methods = useFormContext();
  if (!methods) {
    throw new Error('FormField must be used within a <FormProvider>');
  }
  if (!name) {
    throw new Error('FormField: missing "name" prop');
  }
  return (
    <Controller
      name={name}
      control={methods.control}
      render={({ field }) => render({ field })}
    />
  );
};

const FormItem = ({ children, className }) => {
  return <div className={className}>{children}</div>
};

const FormLabel = ({ children }) => {
  return <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{children}</label>
};

const FormControl = ({ children }) => {
  return <div>{children}</div>
};

const FormMessage = ({ children }) => {
  return <p className="text-sm text-red-500 mt-1">{children}</p>
};

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
};
