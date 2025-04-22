"use client"

import React, { useEffect, useMemo } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";


export interface GenericFormProps {
  /** Existing record to edit (id, attributes, and optional sender_address) */
  startingValues?: {
    id?: string;
    attributes?: Record<string, any>;
    sender_address?: string | null;
  };
  trigger?: React.ReactNode;
  attributesSchema: {
    name: string; // internal key name in the data object
    label: string; // display label for UI
    type: 'text' | 'int' | 'dob' | 'enum';
    required: boolean;
    options?: string[];
  }[];
  /** Label to use in buttons and titles, e.g. "Persona" or "Profile" */
  entityLabel: string;
  /** Server action to call with payload on save */
  saveAction: (payload: {
    id?: string;
    attributes: Record<string, any>;
    sender_address?: string | null;
  }) => Promise<any>;
}

export default function GenericForm({ startingValues, trigger, attributesSchema, entityLabel, saveAction }: GenericFormProps) {
  // Build initial form values based on schema and existing persona attributes
  const initialValues = useMemo(() => {
    const attrs = (startingValues?.attributes ?? {}) as Record<string, any>;
    return attributesSchema.reduce((acc, field) => {
      let value = attrs[field.name] ?? '';
      if (field.type === 'int') value = Number(value) || 0;
      if (field.type === 'dob' && typeof value === 'string') value = value.split('T')[0];
      acc[field.name] = value;
      return acc;
    }, {} as Record<string, any>);
  }, [attributesSchema, startingValues]);

  const { register, handleSubmit, reset, control } = useForm({ defaultValues: initialValues });
  const [open, setOpen] = React.useState(false);

  useEffect(() => {reset(initialValues)}, [initialValues, reset]);

  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      await saveAction({
        id: startingValues?.id,
        attributes: data,
        sender_address: data.sender_address ?? null,
      });
      setOpen(false);
    } catch (error) {
      console.error("Error submitting persona:", error);
    }
  };

  const isEditing = !!startingValues?.id;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Edit ${entityLabel}` : `Create ${entityLabel}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {attributesSchema.map(field => (
              <div key={field.name} className="flex flex-col space-y-1.5">
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === 'text' && (
                  <Input id={field.name} {...register(field.name, { required: field.required })} />
                )}
                {field.type === 'int' && (
                  <Input id={field.name} type="number" step="1" {...register(field.name, { valueAsNumber: true, required: field.required })} />
                )}
                {field.type === 'dob' && (
                  <Input id={field.name} type="date" {...register(field.name, { required: field.required, validate: value => {
                        const dob = new Date(value);
                        const min = new Date();
                        min.setFullYear(min.getFullYear() - 18);
                        return dob <= min || 'Must be at least 18';
                      }
                    })}
                  />
                )}
                {field.type === 'enum' && (
                  <Controller control={control} name={field.name} render={({ field: ctrl }) => (
                      <Select onValueChange={ctrl.onChange} value={ctrl.value}>
                        <SelectTrigger id={field.name}>
                          <SelectValue placeholder={`Select ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}