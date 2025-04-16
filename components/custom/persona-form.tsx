"use client"

import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { getPersonaById } from "@/db/cached-queries";
import { persona } from "@/lib/supabase/types";
import { savePersona } from "@/db/mutations";


export default function PersonaForm({ personaId }: { personaId: string }) {
  const { register, handleSubmit, reset } = useForm<persona>();

  useEffect(() => {
    async function loadPersona() {
      try {
        const res = await getPersonaById(personaId);
        if (!res) throw new Error("Failed to fetch persona");
        reset({
          ...res,
          dob: res.dob.split("T")[0], // ensure date input format
        });
      } catch (error) {
        console.error(error);
      }
    }
    loadPersona();
  }, [personaId, reset]);

  const onSubmit: SubmitHandler<persona> = async (data) => {
    try {
      await savePersona(personaId, "1", data);
      console.log("Persona saved:", data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg"
    >
      <h2 className="text-2xl font-semibold mb-4">Persona Configuration</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Enter persona name"
            {...register("name", { required: true })}
          />
        </div>

        {/* Sex */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="sex">Sex</Label>
          <Select {...register("sex", { required: true })}>
            <SelectTrigger id="sex">
              <SelectValue placeholder="Select Sex" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ethnicity */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="ethnicity">Ethnicity</Label>
          <Select {...register("ethnicity", { required: true })}>
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
        </div>

        {/* Location */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Enter location"
            {...register("location", { required: true })}
          />
        </div>

        {/* Occupation */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            placeholder="Enter Occupation"
            {...register("occupation", { required: true })}
          />
        </div>

        {/* Date of Birth */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="dob">Date of Birth</Label>
          {/* TODO: force this to be a date picker, and at least 18 years old */}
          <Input id="dob" type="date" {...register("dob", { required: true })} />          
        </div>

        {/* Eye Color */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="eye_color">Eye Color</Label>
          <Select {...register("eye_color", { required: true })}>
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
        </div>

        {/* Hair Color */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="hair_color">Hair Color</Label>
          <Select {...register("hair_color", { required: true })}>
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
        </div>

        {/* Haircut */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="haircut">Haircut</Label>
          <Select {...register("haircut", { required: true })}>
            <SelectTrigger id="haircut">
              <SelectValue placeholder="Select Haircut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Long">Long</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Short">Short</SelectItem>
              <SelectItem value="Buzzcut">Buzzcut</SelectItem>
              <SelectItem value="Bald">Bald</SelectItem>
              <SelectItem value="Ponytail">Mohawk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Relationship To You */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="relationship">Relationship</Label>
          <Select {...register("relationship", { required: true })}>
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
              {/* <SelectItem value="Mother">Mother</SelectItem>
              <SelectItem value="Father">Father</SelectItem>
              <SelectItem value="Sister">Sister</SelectItem>
              <SelectItem value="Brother">Brother</SelectItem>
              <SelectItem value="Daughter">Daughter</SelectItem>
              <SelectItem value="Son">Son</SelectItem> */}
            </SelectContent>
          </Select>
        </div>

        {/* Height */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="height">Height (inches)</Label>
          <Input
            id="height"
            type="number"
            step="1"
            {...register("height", { valueAsNumber: true, required: true })}
          />
        </div>

        {/* Weight */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="weight">Weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            step="1"
            {...register("weight", { valueAsNumber: true, required: true })}
          />
        </div>
      </div>
            
      <div className="mt-6 flex justify-end">
        <Button type="submit">Save Persona</Button>
      </div>
    </form>
  );
}
