"use client";

import React, { useMemo } from "react";
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
import { AppHeader } from "./app-header";

export interface FieldSchema {
  name: string;
  label: string;
  description?: string;
  type: "text" | "number" | "email" | "tel" | "date" | "calendar" | "enum";
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
      if ((field.type === "date" || field.type === "calendar") && typeof value === "string") {
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
        attributes, // All form data goes here except sender_address
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
                    {/* Render fields in rows */}
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
                              rules={{ required: field.required }}
                              render={({ field: ctrl }) => (
                                <FormItem style={{ 
                                  gridColumn: field.columnSpan ? `span ${field.columnSpan}` : 'span 1'
                                }}>
                                  <FormLabel>{field.label}</FormLabel>
                                  <FormControl>
                                    {(() => {
                                      switch (field.type) {
                                        case "text": return <Input {...ctrl} />;
                                        case "number": return <Input type="number" {...ctrl} />;
                                        case "email": return <Input type="email" {...ctrl} />;
                                        case "tel": return <Input type="tel" {...ctrl} />;
                                        case "date": return (
                                          <Input
                                            type="date"
                                            value={
                                              ctrl.value instanceof Date
                                                ? ctrl.value.toISOString().split("T")[0]
                                                : ""
                                            }
                                            onChange={(e) =>
                                              ctrl.onChange(new Date(e.target.value))
                                            }
                                          />
                                        );
                                        case "enum": return (
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
                                    })()}
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
                    
                    {/* Render default fields (one per row) */}
                    {defaultFields.map((field) => (
                      <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        rules={{ required: field.required }}
                        render={({ field: ctrl }) => (
                          <FormItem>
                            <FormLabel>{field.label}</FormLabel>
                            <FormControl>
                              {(() => {
                                switch (field.type) {
                                  case "text": return <Input {...ctrl} />;
                                  case "number": return <Input type="number" {...ctrl} />;
                                  case "email": return <Input type="email" {...ctrl} />;
                                  case "tel": return <Input type="tel" {...ctrl} />;
                                  case "date": return (
                                    <Input
                                      type="date"
                                      value={
                                        ctrl.value instanceof Date
                                          ? ctrl.value.toISOString().split("T")[0]
                                          : ""
                                      }
                                      onChange={(e) =>
                                        ctrl.onChange(new Date(e.target.value))
                                      }
                                    />
                                  );
                                  case "enum": return (
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
                              })()}
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