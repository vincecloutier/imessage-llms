"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import React, { useMemo, useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LocationField, } from "@/components/ui/location-input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export interface FieldSchema {
  name: string;
  label: string;
  description?: string;
  type: "text" | "number" | "calendar" | "enum" | "location";
  options?: string[];
  rowId: string;
}

export const LocationValueSchema = z.object({
  name: z.string().min(1, "Location name cannot be empty"),
  lat: z.number({ invalid_type_error: "Latitude must be a number" }),
  lon: z.number({ invalid_type_error: "Longitude must be a number" }),
  timezone: z.string().min(1, "Timezone cannot be empty"),
});

export type LocationValue = z.infer<typeof LocationValueSchema>;

const generateBaseSchemaShape = (fields: FieldSchema[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};
  fields.forEach((field) => {
    let fieldSchema: z.ZodTypeAny;
    switch (field.type) {
      case "text":
        fieldSchema = z.string().max(50, 'Maximum 50 characters allowed').min(1, 'This field is required').refine(val => val.trim() !== '', 'Input cannot be whitespace only');
        break;
      case "number":
        fieldSchema = z.number({ required_error: 'This field is required', invalid_type_error: 'Must be a number' });
        break;
      case "calendar":
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
        fieldSchema = z.date({ required_error: 'This field is required', invalid_type_error: 'Invalid date' }).max(eighteenYearsAgo, { message: 'Must be at least 18 years old' });
        break;
      case "enum":
        if (!field.options || field.options.length === 0) fieldSchema = z.string().min(1, 'This field is required'); 
        else fieldSchema = z.enum(field.options as [string, ...string[]], { required_error: 'This field is required' });
        break;
      case "location":
        fieldSchema = LocationValueSchema;
        break;
      default:
        fieldSchema = z.any().refine(val => val !== undefined && val !== null, { message: 'This field is required' });
    }
    shape[field.name] = fieldSchema;
  });
  shape["sender_address"] = z.string().email({ message: "Invalid email or phone number format for sender address"}).or(z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format for sender address"})).nullable().optional();
  return shape;
};

const generateTransformedSchema = (fields: FieldSchema[]) => {
    const baseShape = generateBaseSchemaShape(fields);
    const baseSchema = z.object(baseShape);
    return baseSchema.transform((data) => {
        const transformedData = { ...data };
        const locationAttrs: Record<string, any> = {};
        fields.forEach(field => {
            const fieldName = field.name;
            const value = transformedData[fieldName];
            if (field.type === 'calendar' && value instanceof Date) {transformedData[fieldName] = value.toISOString().slice(0, 10);}
            if (field.type === 'location') {
                const locationData = value as LocationValue | undefined;
                if (locationData) {
                    locationAttrs['latitude'] = locationData.lat;
                    locationAttrs['longitude'] = locationData.lon;
                    locationAttrs['timezone'] = locationData.timezone;
                    locationAttrs['location'] = locationData.name;
                }
                delete transformedData[fieldName];
            }
        });
        const { sender_address, ...attributes } = {...transformedData, ...locationAttrs};
        return {attributes, sender_address: sender_address ?? null};
    });
};

export interface GenericFormProps {
  startingValues?: {
    id?: string;
    attributes?: Record<string, any>;
    sender_address?: string | null;
  };
  fields: FieldSchema[];
  saveAction: (payload: {
    id?: string;
    attributes: Record<string, any>;
    sender_address?: string | null;
  }) => Promise<any>;
  destructiveButton?: React.ReactNode;
  formTitle: string;
  formDescription: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forceAnswer?: boolean;
}

export default function GenericForm({startingValues, fields, saveAction, destructiveButton, formTitle, formDescription, open, onOpenChange, forceAnswer = false}: GenericFormProps) {
  const router = useRouter();
  const [saveSuccessful, setSaveSuccessful] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const formSchema = useMemo(() => generateTransformedSchema(fields), [fields]);
  type FormInputValues = z.input<typeof formSchema>;

  const initialValues = useMemo(() => {
    const attrs = startingValues?.attributes ?? {};
    const isNewRecord = !startingValues?.id;
    const allFields = fields;
    const initialData: Partial<FormInputValues> = {};
    allFields.forEach((field) => {
       let value: any = attrs[field.name];
        switch (field.type) {
            case "number":
                value = value !== undefined ? Number(value) : (isNewRecord ? undefined : 0);
                break;
            case "calendar":
                const today = new Date();
                const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                value = value ? new Date(value) : eighteenYearsAgo;
                break;
            case "location":
                 const existingLocation = attrs["location"] ? { name: attrs["location"], lat: attrs["latitude"], lon: attrs["longitude"], timezone: attrs["timezone"] } : undefined;
                 value = existingLocation ?? (isNewRecord ? undefined : { name: '', lat: 0, lon: 0, timezone: '' });
                 break;
            default:
                 value = value ?? (isNewRecord ? undefined : "");
        }
       initialData[field.name as keyof FormInputValues] = value;
    });
    if (startingValues?.sender_address !== undefined) {
      initialData.sender_address = startingValues.sender_address;
    } else {
      initialData.sender_address = null 
    }
    return initialData as FormInputValues;
  }, [fields, startingValues]);

  const form = useForm<FormInputValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (saveSuccessful) {
      const savedData = form.getValues();
      form.reset(savedData);
      setSaveSuccessful(false);
      onOpenChange(false);
    }
  }, [saveSuccessful, form, onOpenChange]);

  useEffect(() => {if (open) {form.reset(initialValues);}}, [open, initialValues, form]);

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    await toast.promise(
      saveAction({ id: startingValues?.id, ...data })
        .then((result) => {setSaveSuccessful(true); return result; })
        .catch((err) => {console.error(`Error saving form:`, err); throw err;})
        .finally(() => {setIsSaving(false);}),
      { loading: 'Saving changes...', success: 'Changes saved successfully', error: (err) => `Failed to save changes: ${err.message || 'Unknown error'}`}
    );
    router.push('/chat/0');
    router.refresh();
  };

  const getFieldGroups = (fieldsToGroup: FieldSchema[]) => {
     return fieldsToGroup.reduce((groups, field) => {
         if (!field.rowId) return groups;
         if (!groups[field.rowId]) groups[field.rowId] = [];
         groups[field.rowId].push(field);
         return groups;
     }, {} as Record<string, FieldSchema[]>);
  };

  const renderFormField = (field: FieldSchema, ctrl: any) => {
    const safeValue = ctrl.value ?? '';
    switch (field.type) {
      case "text":
        return <Input {...ctrl} value={safeValue} type={field.type} maxLength={50} />;
      case "number":
        return <Input type="number" {...ctrl} value={safeValue} onChange={e => ctrl.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />;
      case "calendar":
        const dateValue = ctrl.value instanceof Date ? ctrl.value.toISOString().slice(0, 10) : "";
        return <Input type="date" {...ctrl} value={dateValue} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {const date = e.target.value ? new Date(e.target.value) : undefined; ctrl.onChange(date);}} />;
      case "enum":
        return (
          <Select value={safeValue} onValueChange={ctrl.onChange}>
            <SelectTrigger><SelectValue placeholder={`Select ${field.label}`} /></SelectTrigger>
            <SelectContent>{field.options?.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent>
          </Select>
        );
      case "location":
        return <LocationField value={ctrl.value} onChange={ctrl.onChange} />;
      default:
        return <Input {...ctrl} value={safeValue} />;
    }
  };

  const handleOpenChange = (newOpenState: boolean) => {
    if (forceAnswer && !newOpenState) { return; }
    onOpenChange(newOpenState);
  };

  const rowGroups = getFieldGroups(fields);

  const { isDirty, isValid } = form.formState;

  const dialogWidthClass = (fields.length <= 5) ? "sm:max-w-md" : "sm:max-w-[60%] md:max-w-[50%] lg:max-w-[40%]";
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn("max-h-[90vh] overflow-y-auto", dialogWidthClass)}
        showCloseButton={!forceAnswer}
        onEscapeKeyDown={(e) => { if (forceAnswer) e.preventDefault(); }}
        onPointerDownOutside={(e) => { if (forceAnswer) e.preventDefault(); }}
      >
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
          {formDescription && (<DialogDescription>{formDescription}</DialogDescription>)}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="generic-dialog-form" className="space-y-4">
             {Object.entries(rowGroups).map(([rowId, groupedFields]) => (
               <div key={rowId} className={`grid gap-4`} style={{display: 'grid', gridTemplateColumns: `repeat(${groupedFields.length}, minmax(0, 1fr))`, gap: '1rem'}}>
                  {groupedFields.map((field) => (
                    <FormField
                      key={field.name}
                      control={form.control}
                      name={field.name as keyof FormInputValues}
                      render={({ field: ctrl }) => (
                        <FormItem style={{ gridColumn: 'span 1'}}>
                          <FormLabel>{field.label}</FormLabel>
                          <FormControl>
                             {renderFormField(field, ctrl)}
                          </FormControl>
                          {field.description && (<FormDescription>{field.description}</FormDescription>)}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              ))}
          </form>
          <DialogFooter>
             <div className={`flex w-full gap-2 ${destructiveButton ? 'justify-between' : 'justify-end'}`}>
                {destructiveButton}
                <Button type="submit" form="generic-dialog-form" disabled={!isDirty || isSaving || !isValid}> {isSaving ? 'Saving...' : 'Save'}</Button>
            </div>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}