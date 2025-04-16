"use client"

import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
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
  persona: persona;
  trigger?: React.ReactNode;
}

export default function PersonaForm({ persona, trigger }: PersonaFormProps) {
  const { register, handleSubmit, reset } = useForm<persona>();
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    reset({
      ...persona,
      dob: persona.dob.split("T")[0] || "",
    });
  }, [persona, reset]);

  const onSubmit: SubmitHandler<persona> = async (data) => {
    try {
      if (JSON.stringify(persona) !== JSON.stringify(data)) {
        await fetch(`/api/chat?id=${persona.id}`, {
          method: 'PUT',
          body: JSON.stringify({ id: persona.id, persona: data }),
        });
        console.log("Persona saved:", data);  
      }
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Edit Persona</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Persona</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {/* Name */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter Persona Name"
                defaultValue={persona.name || ""}
                {...register("name", { required: true })}
              />
            </div>

            {/* Sex */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="sex">Sex</Label>
              <Select {...register("sex", { required: true })}>
                <SelectTrigger id="sex">
                  <SelectValue placeholder={persona.sex} />
                </SelectTrigger>
                <SelectContent defaultValue={persona.sex}>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter Location"
                {...register("location", { required: true })}
              />
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" {...register("dob", { required: true })} />
            </div>

            {/* Eye Color */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="eye_color">Eye Color</Label>
              <Select {...register("eye_color", { required: true })}>
                <SelectTrigger id="eye_color">
                  <SelectValue placeholder={persona.eye_color} />
                </SelectTrigger>
                <SelectContent defaultValue={persona.eye_color}>
                  <SelectItem value="Blue">Blue</SelectItem>
                  <SelectItem value="Green">Green</SelectItem>
                  <SelectItem value="Brown">Brown</SelectItem>
                  <SelectItem value="Hazel">Hazel</SelectItem>
                  <SelectItem value="Grey">Grey</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Hair Color */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="hair_color">Hair Color</Label>
              <Select {...register("hair_color", { required: true })}>
                <SelectTrigger id="hair_color">
                  <SelectValue placeholder={persona.hair_color} />
                </SelectTrigger>
                <SelectContent defaultValue={persona.hair_color}>
                  <SelectItem value="Brown">Brown</SelectItem>
                  <SelectItem value="Blonde">Blonde</SelectItem>
                  <SelectItem value="Red">Red</SelectItem>
                  <SelectItem value="Black">Black</SelectItem>
                  <SelectItem value="White">White</SelectItem>
                  <SelectItem value="Grey">Grey</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Haircut */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="haircut">Haircut</Label>
              <Select {...register("haircut", { required: true })}>
                <SelectTrigger id="haircut">
                  <SelectValue placeholder={persona.haircut} />
                </SelectTrigger>
                <SelectContent defaultValue={persona.haircut}>
                  <SelectItem value="Long">Long</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Short">Short</SelectItem>
                  <SelectItem value="Buzzcut">Buzzcut</SelectItem>
                  <SelectItem value="Bald">Bald</SelectItem>
                  <SelectItem value="Mohawk">Mohawk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ethnicity */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="ethnicity">Ethnicity</Label>
              <Select {...register("ethnicity", { required: true })}>
                <SelectTrigger id="ethnicity">
                  <SelectValue placeholder={persona.ethnicity} />
                </SelectTrigger>
                <SelectContent defaultValue={persona.ethnicity}>
                  <SelectItem value="Asian">Asian</SelectItem>
                  <SelectItem value="Black">Black</SelectItem>
                  <SelectItem value="Hispanic">Hispanic</SelectItem>
                  <SelectItem value="White">White</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Relationship */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="relationship">Relationship</Label>
              <Select {...register("relationship", { required: true })}>
                <SelectTrigger id="relationship">
                  <SelectValue placeholder={persona.relationship} />
                </SelectTrigger>
                <SelectContent defaultValue={persona.relationship}>
                  <SelectItem value="Friend">Friend</SelectItem>
                  <SelectItem value="Girlfriend">Girlfriend</SelectItem>
                  <SelectItem value="Boyfriend">Boyfriend</SelectItem>
                  <SelectItem value="Wife">Wife</SelectItem>
                  <SelectItem value="Husband">Husband</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Occupation */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                placeholder="Enter Occupation"
                defaultValue={persona.occupation || ""}
                {...register("occupation", { required: true })}
              />
            </div>

            {/* Height */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="height">Height (inches)</Label>
              <Input
                id="height"
                type="number"
                step="1"
                defaultValue={persona.height || 0}
                {...register("height", { valueAsNumber: true, required: true })}
              />
            </div>

            {/* Weight */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                step="1"
                defaultValue={persona.weight || 0}
                {...register("weight", { valueAsNumber: true, required: true })}
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