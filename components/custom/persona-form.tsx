"use client"

import React, { useEffect } from "react";
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

import { persona } from "@/lib/supabase/types";

interface PersonaFormProps {
  persona?: persona;
  trigger?: React.ReactNode;
}

const defaultValues: Partial<persona> = {
  name: "",
  sex: undefined,
  location: "",
  dob: "",
  eye_color: undefined,
  hair_color: undefined,
  haircut: undefined,
  ethnicity: undefined,
  relationship: undefined,
  occupation: "",
  height: 0,
  weight: 0,
};

export default function PersonaForm({ persona, trigger }: PersonaFormProps) {
  const { register, handleSubmit, reset, control } = useForm<persona>({
    defaultValues: defaultValues,
  });
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (persona) {
      reset({
        ...persona,
        dob: persona.dob?.split("T")[0] || "",
      });
    } else {
      reset(defaultValues);
    }
  }, [persona, reset, open]);

  const onSubmit: SubmitHandler<persona> = async (data) => {
    try {
      if (!persona || JSON.stringify(persona) !== JSON.stringify(data)) {
        await fetch(`/api/personas`, {
          method: 'POST',
          body: JSON.stringify({ id: persona?.id, persona: data }),
        });
        console.log(`Persona created:`, data);
      }
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const isEditing = !!persona?.id;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">{isEditing ? "Edit Persona" : "Create Persona"}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Persona" : "Create Persona"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {/* Name */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter Persona Name"
                {...register("name", { required: "Name is required" })}
              />
            </div>

            {/* Sex */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="sex">Sex</Label>
              <Controller
                control={control}
                name="sex"
                rules={{ required: "Sex is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="sex">
                      <SelectValue placeholder="Select Sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Location */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter Location"
                {...register("location", { required: "Location is required" })}
              />
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                {...register("dob", { required: "Date of Birth is required" })}
              />
            </div>

            {/* Eye Color */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="eye_color">Eye Color</Label>
              <Controller
                control={control}
                name="eye_color"
                rules={{ required: "Eye color is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="eye_color">
                      <SelectValue placeholder="Select Eye Color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Blue">Blue</SelectItem>
                      <SelectItem value="Green">Green</SelectItem>
                      <SelectItem value="Brown">Brown</SelectItem>
                      <SelectItem value="Hazel">Hazel</SelectItem>
                      <SelectItem value="Grey">Grey</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Hair Color */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="hair_color">Hair Color</Label>
              <Controller
                control={control}
                name="hair_color"
                rules={{ required: "Hair color is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="hair_color">
                      <SelectValue placeholder="Select Hair Color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Brown">Brown</SelectItem>
                      <SelectItem value="Blonde">Blonde</SelectItem>
                      <SelectItem value="Red">Red</SelectItem>
                      <SelectItem value="Black">Black</SelectItem>
                      <SelectItem value="White">White</SelectItem>
                      <SelectItem value="Grey">Grey</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Haircut */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="haircut">Haircut</Label>
              <Controller
                control={control}
                name="haircut"
                rules={{ required: "Haircut is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="haircut">
                      <SelectValue placeholder="Select Haircut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Long">Long</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Short">Short</SelectItem>
                      <SelectItem value="Buzzcut">Buzzcut</SelectItem>
                      <SelectItem value="Bald">Bald</SelectItem>
                      <SelectItem value="Mohawk">Mohawk</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Ethnicity */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="ethnicity">Ethnicity</Label>
              <Controller
                control={control}
                name="ethnicity"
                rules={{ required: "Ethnicity is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="ethnicity">
                      <SelectValue placeholder="Select Ethnicity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asian">Asian</SelectItem>
                      <SelectItem value="Black">Black</SelectItem>
                      <SelectItem value="Hispanic">Hispanic</SelectItem>
                      <SelectItem value="White">White</SelectItem>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Relationship */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="relationship">Relationship</Label>
              <Controller
                control={control}
                name="relationship"
                rules={{ required: "Relationship is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="relationship">
                      <SelectValue placeholder="Select Relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Friend">Friend</SelectItem>
                      <SelectItem value="Girlfriend">Girlfriend</SelectItem>
                      <SelectItem value="Boyfriend">Boyfriend</SelectItem>
                      <SelectItem value="Wife">Wife</SelectItem>
                      <SelectItem value="Husband">Husband</SelectItem>
                      <SelectItem value="Partner">Partner</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Occupation */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                placeholder="Enter Occupation"
                {...register("occupation", { required: "Occupation is required" })}
              />
            </div>

            {/* Height */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="height">Height (inches)</Label>
              <Input
                id="height"
                type="number"
                step="1"
                {...register("height", {
                  valueAsNumber: true,
                  required: "Height is required",
                  min: { value: 1, message: "Height must be positive" }
                })}
              />
            </div>

            {/* Weight */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                step="1"
                {...register("weight", {
                  valueAsNumber: true,
                  required: "Weight is required",
                  min: { value: 1, message: "Weight must be positive" }
                })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}