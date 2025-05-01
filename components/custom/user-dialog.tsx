"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { saveProfile } from "@/lib/actions";
import {UserRound } from "lucide-react"

// 1. Define the form schema with Zod.
// Basic phone regex (adjust as needed for specific formats)
const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]\d{3}[)])?([-]?[\s]?)(\d{3})([-]?[\s]?)(\d{4})$/
);

const formSchema = z.object({
  name: z.string().min(2, {message: "Name must be at least 2 characters.",}),
  age: z.coerce.number({required_error: "Age is required.", invalid_type_error: "Age must be a number." })
    .int()
    .min(18, { message: "You must be at least 18 years old." }),
  telephone: z.string()
    .min(10, { message: "Telephone number seems too short."})
    .regex(phoneRegex, { message: "Invalid phone number format." }),
  location: z.string().min(3, {message: "Location must be at least 3 characters."}),
});


export function UserInfoDialog({ requiresProfile = false }: {requiresProfile?: boolean}) {
  const [open, setOpen] = useState(requiresProfile);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 2. Define the form using react-hook-form and zodResolver.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: undefined, // Initialize number fields that are required as undefined or specific default
      telephone: "",
      location: "",
    },
  });

  // 3. Define the submit handler which triggers the Server Action.
  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        try {
            const result = await saveProfile({ attributes: values, sender_address: values.telephone });
            if (result.success) {
                setIsProfileSaved(true);
                toast.success("Success!", {description: result.message});
                form.reset();
                setOpen(false);
            } else {
                toast.error("Submission Failed", {description: result.message || "An unexpected server error occurred."});
            }
        } catch (error) {
            console.error("Submission process error:", error);
            toast.error("Error", {description: "An unexpected error occurred during submission."});
        }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!requiresProfile || isProfileSaved) {
          setOpen(isOpen);
        }
      }}>
      <DialogTrigger asChild>
        {!requiresProfile && <Button variant="ghost" size="icon" className="h-7 w-7"> <UserRound className="size-4"/> </Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]"
          onEscapeKeyDown={(e) => {
            if (requiresProfile && !isProfileSaved) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            if (requiresProfile && !isProfileSaved) {
              e.preventDefault();
            }
          }}
         >
        <DialogHeader>
          <DialogTitle>User Information</DialogTitle>
          <DialogDescription>
            Fill in your details below. Click submit when done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 25" {...field} value={field.value ?? ""} />
                  </FormControl>
                   <FormDescription>
                    Must be 18 or older.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="telephone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telephone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="e.g., 123-456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., City, Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
               <Button
                 type="button"
                 variant="ghost"
                 onClick={() => { if (!requiresProfile || isProfileSaved) { form.reset(); setOpen(false); } }}
                 disabled={requiresProfile && !isProfileSaved}
               >
                 Cancel
               </Button>
               <Button type="submit" disabled={isPending}> {isPending ? "Submitting..." : "Submit"} </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
