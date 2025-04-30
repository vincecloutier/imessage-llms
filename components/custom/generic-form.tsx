"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import React, { useMemo, useEffect, useState} from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";

import { searchCity } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  tabKey?: string; // Optional tab this page belongs to
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
  useTabs?: boolean; // Whether to use tabs or not
  showSignOutButton?: boolean; // Show sign out button if true
}

export default function GenericForm({startingValues, pages, saveAction, useTabs = true, showSignOutButton = false}: GenericFormProps) {
  const router = useRouter();
  
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }
  
  // build initial form values across all pages
  const initialValues = useMemo(() => {
    const attrs = startingValues?.attributes ?? {};
    const allFields = pages.flatMap((p) => p.fields);
    const initialData = allFields.reduce((acc, field) => {
      let value = attrs[field.name] ?? "";
      if (field.type === "number") value = Number(value) || 0;
      if (field.type === "calendar") {
        const today = new Date();
        const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        value = attrs[field.name] ? new Date(attrs[field.name]) : eighteenYearsAgo;
      }
      if (field.type === "city") {
        // Reconstruct city object from flattened fields
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
    // add sender_address if it exists
    if (startingValues?.sender_address !== undefined) {
      initialData.sender_address = startingValues.sender_address;
    }
    return initialData;
  }, [pages, startingValues]);

  // Track the last saved values for comparison after submit
  const [lastSavedValues, setLastSavedValues] = useState(initialValues);

  const form = useForm({
    defaultValues: initialValues,
    mode: "onChange",
  });

  // Track if form has changes
  const [formHasChanges, setFormHasChanges] = useState(false);
  // Track form submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccessful, setSaveSuccessful] = useState(false);
  
  // Watch for form changes
  const currentValues = form.watch();
  
  // Reset form state after successful save
  useEffect(() => {
    if (saveSuccessful) {
      // Update our reference values to match the current values
      setLastSavedValues(currentValues);
      form.reset(currentValues);
      setFormHasChanges(false);
      setSaveSuccessful(false);
    }
  }, [saveSuccessful, currentValues, form]);
  
  // Detect form changes - compare with lastSavedValues instead of initialValues
  useEffect(() => {
    if (!isSubmitting) {
      const isEqual = deepEqual(lastSavedValues, currentValues);
      setFormHasChanges(!isEqual);
    }
  }, [currentValues, lastSavedValues, isSubmitting]);

  const onSubmit = async (data: Record<string, any>) => {
    try {
      setIsSubmitting(true);
      
      // Convert all Date objects to YYYY-MM-DD format
      const formattedData = {...data};
      
      // Find calendar fields
      const calendarFields = pages.flatMap(p => p.fields).filter(f => f.type === "calendar").map(f => f.name);
      
      // Format calendar dates to YYYY-MM-DD
      calendarFields.forEach(fieldName => {
        if (formattedData[fieldName] instanceof Date) {
          formattedData[fieldName] = formattedData[fieldName].toISOString().slice(0, 10);
        }
      });
      
      // Find and flatten all city fields
      const cityFields = pages.flatMap(p => p.fields).filter(f => f.type === "city").map(f => f.name);
      
      cityFields.forEach(fieldName => {
        const cityData = formattedData[fieldName];
        if (cityData && typeof cityData === 'object' && cityData.name) {
          formattedData[`latitude`] = cityData.lat;
          formattedData[`longitude`] = cityData.lon;
          formattedData[`timezone`] = cityData.timezone;
          formattedData[`location`] = cityData.name;
        }
      });
      
      // Extract sender_address if it exists
      const { sender_address, ...attributes } = formattedData;
      
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
        {
          loading: 'Saving changes...',
          success: 'Changes saved successfully',
          error: 'Failed to save changes'
        }
      );
    } catch (error) {
      setIsSubmitting(false);
      console.error(`Error submitting form:`, error);
      toast.error("Failed to save changes");
    }
  };

  // Group pages by tab for optional tab rendering
  const pagesByTab = useMemo(() => {
    if (!useTabs) {
      return { noTab: pages };
    }
    
    return pages.reduce((acc, page) => {
      const tabKey = page.tabKey || page.key;
      if (!acc[tabKey]) acc[tabKey] = [];
      acc[tabKey].push(page);
      return acc;
    }, {} as Record<string, PageSchema[]>);
  }, [pages, useTabs]);

  // Get tabs from the grouped pages
  const tabs = useMemo(() => Object.keys(pagesByTab), [pagesByTab]);
  const defaultTab = tabs[0] || 'noTab';

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
          <Input
            type="date"
            {...ctrl}
            value={ctrl.value instanceof Date ? ctrl.value.toISOString().slice(0, 10) : ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => ctrl.onChange(new Date(e.target.value))}
          />
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
      case "city":
        // Store input text separately from the actual city value
        const [cityInputText, setCityInputText] = useState("");
        const [errorMessage, setErrorMessage] = useState("");
        const [isSearching, setIsSearching] = useState(false);
        
        const handleCitySearch = async () => {
          if (cityInputText.length < 3) {
            setErrorMessage("Please enter at least 3 characters");
            return;
          }
          
          setIsSearching(true);
          setErrorMessage("Searching...");
          
          try {
            // Call the server action
            const result = await searchCity(cityInputText);
            
            if (result && !result.error) {
              ctrl.onChange(result);
              setCityInputText(result.name || '');
              setErrorMessage("");
            } else {
              setErrorMessage(result.error || "No matching location found");
              ctrl.onChange(null);
            }
          } catch (error) {
            console.error("City search error:", error);
            setErrorMessage("Error searching for city. Please try again.");
            ctrl.onChange(null);
          } finally {
            setIsSearching(false);
          }
        };
        
        // Initialize input field with existing value
        useEffect(() => {
          if (ctrl.value && ctrl.value.name) {
            setCityInputText(ctrl.value.name);
          }
        }, []);
        
        return (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                type="text"
                value={cityInputText}
                onChange={(e) => setCityInputText(e.target.value)}
                placeholder="Enter city name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCitySearch();
                  }
                }}
              />
              <Button 
                type="button"
                onClick={handleCitySearch}
                disabled={isSearching}
              >
                Search
              </Button>

            </div>
            {errorMessage && <p className="text-sm">{errorMessage}</p>}
          </div>
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

  const renderPageContent = (page: PageSchema) => {
    const { defaultFields, rowGroups, rowLayouts } = getFieldGroups(page.fields, page.rowLayouts);
    
    return (
      <Card key={page.key} className="mb-4">
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
              <div key={rowId} className={`grid gap-4`} style={{ 
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
      </Card>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {useTabs && tabs.length > 1 ? (
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className={`grid w-full grid-cols-${Math.min(tabs.length, 4)}`}>
              {tabs.map((tabKey) => {
                const firstPage = pagesByTab[tabKey][0];
                return (
                  <TabsTrigger key={tabKey} value={tabKey}>
                    {firstPage.tabKey ? tabKey : firstPage.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {tabs.map((tabKey) => (
              <TabsContent key={tabKey} value={tabKey}>
                {pagesByTab[tabKey].map(renderPageContent)}
                <div className="mt-4 flex justify-between gap-2">
                  {showSignOutButton && <Button variant="outline" type="button" onClick={signOut}>Sign Out</Button>}
                  <Button type="submit" disabled={!formHasChanges || isSubmitting}>Save Changes</Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <>
            {pages.map(renderPageContent)}
            <div className="mt-4 flex justify-between gap-2">
              {showSignOutButton && <Button variant="outline" type="button" onClick={signOut}>Sign Out</Button>}
              <Button type="submit" disabled={!formHasChanges || isSubmitting}>Save Changes</Button>
            </div>
          </>
        )}
      </form>
    </Form>
  );
}