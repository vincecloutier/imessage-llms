"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import React, { useMemo, useEffect, useState, useCallback } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import { searchCity } from "@/lib/actions";

const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2;
  }
  
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime();
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => 
    keys2.includes(key) && deepEqual(obj1[key], obj2[key])
  );
};

export interface FieldSchema {
  name: string;
  label: string;
  description?: string;
  type: "text" | "number" | "email" | "tel" | "calendar" | "enum" | "city";
  options?: string[];
  required: boolean;
  rowId: string;
}

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

interface CityFieldProps {
  value: any;
  onChange: (val: any) => void;
}

const CityField: React.FC<CityFieldProps> = ({ value, onChange }) => {
  const [cityInputText, setCityInputText] = useState(value?.name || "");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleCitySearch = useCallback(async () => {
    if (cityInputText.length < 3) {
      setErrorMessage("Please enter at least 3 characters");
      return;
    }
    setIsSearching(true);
    setErrorMessage("Searching...");
    try {
      const result = await searchCity(cityInputText);
      if (result && !result.error) {
        onChange(result);
        setCityInputText(result.name || "");
        setErrorMessage("");
      } else {
        setErrorMessage(result.error || "No matching location found");
        onChange(null);
      }
    } catch (error) {
      setErrorMessage("Error searching for city. Please try again.");
      onChange(null);
    } finally {
      setIsSearching(false);
    }
  }, [cityInputText, onChange]);

  useEffect(() => {
    if (value && value.name) setCityInputText(value.name);
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          type="text"
          value={cityInputText}
          onChange={e => setCityInputText(e.target.value)}
          placeholder="Enter city name"
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCitySearch();
            }
          }}
        />
        <Button type="button" onClick={handleCitySearch} disabled={isSearching}>
          Search
        </Button>
      </div>
      {errorMessage && <p className="text-sm">{errorMessage}</p>}
    </div>
  );
};

export default function GenericForm({
  startingValues,
  fields,
  saveAction,
  destructiveButton,
  formTitle,
  formDescription,
  open,
  onOpenChange,
  forceAnswer = false
}: GenericFormProps) {  
  const initialValues = useMemo(() => {
    const attrs = startingValues?.attributes ?? {};
    const allFields = fields;
    const initialData = allFields.reduce((acc, field) => {
      let value = attrs[field.name] ?? "";
      if (field.type === "number") value = Number(value) || 0;
      if (field.type === "calendar") {
        const today = new Date();
        const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        value = attrs[field.name] ? new Date(attrs[field.name]) : eighteenYearsAgo;
      }
      if (field.type === "city") {
        value = {
          name: attrs["location"] || "",
          lat: attrs["latitude"],
          lon: attrs["longitude"],
          timezone: attrs["timezone"]
        };
      }
      acc[field.name] = value;
      return acc;
    }, {} as Record<string, any>);
    if (startingValues?.sender_address !== undefined) {
      initialData.sender_address = startingValues.sender_address;
    }
    return initialData;
  }, [fields, startingValues]);

  const [lastSavedValues, setLastSavedValues] = useState(initialValues);

  const form = useForm({
    defaultValues: initialValues,
    mode: "onChange",
  });

  const [formHasChanges, setFormHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccessful, setSaveSuccessful] = useState(false);
  
  const currentValues = form.watch();
  
  useEffect(() => {
    if (saveSuccessful) {
      setLastSavedValues(currentValues);
      form.reset(currentValues); 
      setFormHasChanges(false);
      setSaveSuccessful(false);
      onOpenChange(false);
    }
  }, [saveSuccessful, currentValues, form, onOpenChange]);
  
  useEffect(() => {
    if (!isSubmitting) {
      const isEqual = deepEqual(lastSavedValues, currentValues);
      setFormHasChanges(!isEqual);
    }
  }, [currentValues, lastSavedValues, isSubmitting]);

  const onSubmit = async (data: Record<string, any>) => {
    try {
      setIsSubmitting(true);
      const formattedData = {...data};
      
      const allFields = fields;
      
      const calendarFields = allFields.filter(f => f.type === "calendar").map(f => f.name);
      calendarFields.forEach(fieldName => {
        if (formattedData[fieldName] instanceof Date) {
          formattedData[fieldName] = formattedData[fieldName].toISOString().slice(0, 10);
        }
      });
      
      const cityFields = allFields.filter(f => f.type === "city").map(f => f.name);
      const locationAttrs: Record<string, any> = {};

      cityFields.forEach(fieldName => {
        const cityData = formattedData[fieldName];
        if (cityData && typeof cityData === 'object' && cityData.name && cityData.lat !== undefined && cityData.lon !== undefined && cityData.timezone) {
          locationAttrs[`latitude`] = cityData.lat;
          locationAttrs[`longitude`] = cityData.lon;
          locationAttrs[`timezone`] = cityData.timezone;
          locationAttrs[`location`] = cityData.name;
        } else {
          locationAttrs[`latitude`] = null;
          locationAttrs[`longitude`] = null;
          locationAttrs[`timezone`] = null;
          locationAttrs[`location`] = null;
        }
        delete formattedData[fieldName];
      });
      
      const finalFormattedData = { ...formattedData, ...locationAttrs };
      
      const { sender_address, ...attributes } = finalFormattedData;
      
      const payload = {
        id: startingValues?.id,
        attributes,
        sender_address: sender_address ?? null,
      };
      
      toast.promise(
        saveAction(payload)
          .then((result) => {
            setSaveSuccessful(true); 
            return result;
          })
          .finally(() => {
            setIsSubmitting(false);
          }),
        { loading: 'Saving changes...', success: 'Changes saved successfully', error: 'Failed to save changes' }
      );
    } catch (error) {
      setIsSubmitting(false);
      console.error(`Error submitting form:`, error);
      toast.error("Failed to save changes");
    }
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
    switch (field.type) {
      case "text": 
      case "email": 
      case "tel": 
        return <Input {...ctrl} type={field.type} maxLength={50} />;
      case "number": 
        return <Input type="number" {...ctrl} />;
      case "calendar":
        return (
          <Input
            type="date"
            {...ctrl}
            value={ctrl.value instanceof Date ? ctrl.value.toISOString().slice(0, 10) : ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => ctrl.onChange(new Date(e.target.value))}
          />
        );
      case "enum": 
        return (
          <Select value={ctrl.value} onValueChange={ctrl.onChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label}`}/>
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
            </SelectContent>
          </Select>
        );
      case "city":
        return <CityField value={ctrl.value} onChange={ctrl.onChange} />;
      default: return <Input {...ctrl} />;
    }
  };

  const getValidationRules = (field: FieldSchema) => {
    const rules: any = { required: field.required ? 'This field is required' : false };
    
    if (field.type === 'text' || field.type === 'email' || field.type === 'tel') {
      rules.maxLength = { value: 50, message: 'Maximum 50 characters allowed' };
      rules.validate = { ...(rules.validate || {}), noWhitespaceOnly: (value: string) => value.trim() !== '' || 'Input cannot be whitespace only' };
    }
    if (field.type === 'calendar') {
      rules.validate = {
        ...(rules.validate || {}),
        over18: (value: Date) => {
          const today = new Date();
          const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
          return value <= eighteenYearsAgo || 'Must be at least 18 years old';
        }
      };
    }
    
    if (field.type === 'enum') {
      rules.validate = {
        ...(rules.validate || {}),
        enum: (value: string) => field.options?.includes(value) || `Invalid option: ${value}`
      };
    }
    if (field.type === "city") {
      rules.validate = {
        ...(rules.validate || {}),
        location: (v: any) =>
          v &&
          typeof v === "object" &&
          v.name &&
          v.lat !== undefined &&
          v.lon !== undefined &&
          v.timezone ? true : "Select a location",
      };
    }
    return rules;
  };

  const handleOpenChange = (newOpenState: boolean) => {
    if (forceAnswer && !newOpenState) {
      return; 
    }
    if (newOpenState && !open) { 
      form.reset(initialValues);
      setLastSavedValues(initialValues);
      setFormHasChanges(false);
    } 
    onOpenChange(newOpenState);
  }
  
  useEffect(() => {
    if (open) {
      form.reset(initialValues);
      setLastSavedValues(initialValues);
      setFormHasChanges(false);
    }
  }, [initialValues, open, form]);

  const rowGroups = getFieldGroups(fields);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[60%] md:max-w-[50%] lg:max-w-[40%] max-h-[90vh] overflow-y-auto"
        showCloseButton={!forceAnswer}
        onEscapeKeyDown={(e) => {if (forceAnswer) e.preventDefault();}}
        onPointerDownOutside={(e) => {if (forceAnswer) e.preventDefault();}}
      >
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
          {formDescription && (<DialogDescription>{formDescription}</DialogDescription>)}
        </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="generic-dialog-form" className="space-y-4">
              {Object.entries(rowGroups).map(([rowId, groupedFields]) => {                
                return (
                  <div key={rowId} className={`grid gap-4`} style={{display: 'grid', gridTemplateColumns: `repeat(${groupedFields.length}, minmax(0, 1fr))`, gap: '1rem'}}>
                    {groupedFields.map((field) => (
                      <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        rules={getValidationRules(field)}
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
                );
              })}
            </form>
            <DialogFooter>
            <div className={`flex w-full gap-2 ${destructiveButton ? 'justify-between' : 'justify-end'}`}>
              {destructiveButton}
              <Button type="submit" form="generic-dialog-form" disabled={!formHasChanges || isSubmitting}>Save</Button>
            </div>
            </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}