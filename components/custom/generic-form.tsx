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
}

export interface PageSchema {
  key: string;
  label: string;
  description?: string;
  fields: FieldSchema[];
}

export interface GenericFormProps {
  startingValues?: {
    id?: string;
    attributes?: Record<string, any>;
    sender_address?: string | null;
  };
  pages: PageSchema[];
  entityLabel: string;
  saveAction: (payload: {
    id?: string;
    attributes: Record<string, any>;
    sender_address?: string | null;
  }) => Promise<any>;
}

export default function GenericForm({startingValues, pages, entityLabel, saveAction}: GenericFormProps) {
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
      await saveAction({
        id: startingValues?.id,
        attributes: data,
        sender_address: data.sender_address ?? null,
      });
    } catch (error) {
      console.error(`Error saving ${entityLabel}:`, error);
    }
  };

  const defaultTab = pages[0]?.key;

  return (
    <>
    <AppHeader title={"Configure"} subtitle={entityLabel} />
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
          {pages.map((page) => (
            <TabsContent key={page.key} value={page.key}>
              <Card>
                <CardHeader>
                  <CardTitle>{page.label}</CardTitle>
                  {page.description && (
                    <CardDescription>{page.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {page.fields.map((field) => (
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
          ))}
        </Tabs>
      </form>
    </Form>
    </>
  );
}