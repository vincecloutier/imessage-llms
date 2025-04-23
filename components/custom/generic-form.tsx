"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isAfter, subYears } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FieldSchema {
  name: string;
  label: string;
  description?: string;
  type: "text" | "number" | "email" | "tel" | "calendar" | "enum";
  required: boolean;
  options?: string[];
  rowId?: string; // Fields with the same rowId will be rendered in the same row
  columnSpan?: number; // How many columns this field should span (default: 1)
}

export interface RowLayout {
  id: string;
  columns: number; // Number of equal columns in this row
}

export interface PageSchema {
  key: string;
  label: string;
  description?: string;
  fields: FieldSchema[];
  rowLayouts?: RowLayout[]; // Define rows and their column counts
}

export interface GenericFormProps {
  startingValues?: {
    id?: string;
    attributes?: Record<string, any>;
    sender_address?: string | null;
  };
  pages: PageSchema[];
  saveAction: (payload: {
    id?: string;
    attributes: Record<string, any>;
    sender_address?: string | null;
  }) => Promise<any>;
}

export default function GenericForm({startingValues, pages, saveAction}: GenericFormProps) {  
  // Build initial form values across all pages
  const initialValues = useMemo(() => {
    const attrs = startingValues?.attributes ?? {};
    const allFields = pages.flatMap((p) => p.fields);
    return allFields.reduce((acc, field) => {
      let value = attrs[field.name] ?? "";
      if (field.type === "number") value = Number(value) || 0;
      if ((field.type === "calendar") && typeof value === "string") {
        value = new Date(value);
      }
      if (field.type === "calendar") {
        value = new Date(value);
      }
      acc[field.name] = value;
      return acc;
    }, {} as Record<string, any>);
  }, [pages, startingValues]);

  const form = useForm({
    defaultValues: initialValues,
    mode: "onChange",
  });

  const onSubmit = async (data: Record<string, any>) => {
    try {
      // Extract sender_address if it exists
      const { sender_address, ...attributes } = data;
      
      await saveAction({
        id: startingValues?.id,
        attributes,
        sender_address: sender_address ?? null,
      });
    } catch (error) {
      console.error(`Error submitting form:`, error);
    }
  };

  const defaultTab = pages[0]?.key;

  // Group fields by rowId for each page
  const getFieldGroups = (fields: FieldSchema[], rowLayouts?: RowLayout[]) => {
    // Fields without rowId will go in their own individual rows
    const defaultFields = fields.filter(f => !f.rowId);
    
    // Group fields that share rowIds
    const rowGroups = fields
      .filter(f => f.rowId)
      .reduce((groups, field) => {
        if (!field.rowId) return groups;
        if (!groups[field.rowId]) groups[field.rowId] = [];
        groups[field.rowId].push(field);
        return groups;
      }, {} as Record<string, FieldSchema[]>);
    
    return { defaultFields, rowGroups, rowLayouts };
  };

  // Validation helper functions
  const isOver18 = (date: Date) => {
    const eighteenYearsAgo = subYears(new Date(), 18);
    return isAfter(eighteenYearsAgo, date);
  };

  const noWhitespaceOnly = (value: string) => {
    if (typeof value !== 'string') return true;
    return value.trim() !== '' || 'Input cannot be whitespace only';
  };

  // The field renderer with location support
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
          <Input type="date" {...ctrl}  />
        );
      case "enum": 
        return (
          <Select
            value={ctrl.value}
            onValueChange={ctrl.onChange}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={`Select ${field.label}`}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default: return <Input {...ctrl} />;
    }
  };

  // Get validation rules based on field type
  const getValidationRules = (field: FieldSchema) => {
    const rules: any = { required: field.required ? 'This field is required' : false };
    
    if (field.type === 'text' || field.type === 'email' || field.type === 'tel') {
      rules.maxLength = { value: 50, message: 'Maximum 50 characters allowed' };
      rules.validate = { noWhitespaceOnly };
    }
    
    if (field.type === 'calendar') {
      rules.validate = { 
        over18: (value: Date) => isOver18(value) || 'Must be at least 18 years old' 
      };
    }
    
    return rules;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {pages.map((page) => (
              <TabsTrigger key={page.key} value={page.key}>
                {page.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {pages.map((page) => {
            const { defaultFields, rowGroups, rowLayouts } = getFieldGroups(page.fields, page.rowLayouts);
            
            return (
              <TabsContent key={page.key} value={page.key}>
                <Card>
                  <CardHeader>
                    <CardTitle>{page.label}</CardTitle>
                    {page.description && (
                      <CardDescription>{page.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(rowGroups).map(([rowId, fields]) => {
                      const rowLayout = rowLayouts?.find(r => r.id === rowId);
                      const columns = rowLayout?.columns || fields.length;
                      
                      return (
                        <div key={rowId} className={`grid grid-cols-${columns} gap-4`} style={{ 
                          display: 'grid', 
                          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                          gap: '1rem'
                        }}>
                          {fields.map((field) => (
                            <FormField
                              key={field.name}
                              control={form.control}
                              name={field.name}
                              rules={getValidationRules(field)}
                              render={({ field: ctrl }) => (
                                <FormItem style={{ 
                                  gridColumn: field.columnSpan ? `span ${field.columnSpan}` : 'span 1'
                                }}>
                                  <FormLabel>{field.label}</FormLabel>
                                  <FormControl>
                                    {renderFormField(field, ctrl)}
                                  </FormControl>
                                  {field.description && (
                                    <FormDescription>{field.description}</FormDescription>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      );
                    })}
                    
                    {defaultFields.map((field) => (
                      <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        rules={getValidationRules(field)}
                        render={({ field: ctrl }) => (
                          <FormItem>
                            <FormLabel>{field.label}</FormLabel>
                            <FormControl>
                              {renderFormField(field, ctrl)}
                            </FormControl>
                            {field.description && (
                              <FormDescription>{field.description}</FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button type="submit">Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </form>
    </Form>
  );
}