'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

import { Persona, User } from '@/lib/types'
import { Pencil, Plus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { deletePersona, savePersona } from '@/lib/actions'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaBody,
} from '@/components/ui/credenza'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MessagingPlatformField } from '@/components/ui/messaging-platform-field'

const messagingPlatformValueSchema = z.object({
  is_imessage_persona: z.boolean(),
  is_telegram_persona: z.boolean(),
})

const personaFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  model: z.string().min(1, 'Model is required'),
  temperature: z.coerce
    .number()
    .min(0, 'Temperature must be at least 0')
    .max(2, 'Temperature must be at most 2'),
  messaging_platform: messagingPlatformValueSchema,
})

type PersonaFormValues = z.infer<typeof personaFormSchema>

// Replace the defaultColors array with Tailwind color classes
const defaultColors = [
  'bg-indigo-600', // Indigo
  'bg-blue-600', // Blue
  'bg-cyan-600', // Cyan
  'bg-orange-600', // Orange
  'bg-red-600', // Red
  'bg-purple-600', // Purple
  'bg-pink-600', // Pink
  'bg-emerald-600', // Emerald
]

const generateColorFromId = (id: string): string => {
  const colorIndex = Math.abs(parseInt(id.slice(-1)) % defaultColors.length)
  return defaultColors[colorIndex]
}

interface PersonaAvatarProps {
  personaId: string
  personaName?: string | null
  onClick?: () => void
}

export const PersonaAvatar = ({ personaId, personaName, onClick }: PersonaAvatarProps) => {
  const colorClass = generateColorFromId(personaId)
  const [isHovered, setIsHovered] = useState(false)

  function handleHover() {
    if (onClick) {
      setIsHovered(true)
    }
  }

  function handleLeave() {
    if (onClick) {
      setIsHovered(false)
    }
  }

  return (
    <Avatar
      className={`size-8 rounded-lg ${colorClass} text-white overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
    >
      <AvatarFallback className="rounded-lg bg-transparent">
        {isHovered ? <Pencil className="size-4" /> : personaName}
      </AvatarFallback>
    </Avatar>
  )
}

export function PersonaForm({
  user,
  persona,
  showButton = true,
  freshProfile = false,
}: {
  user: User
  persona: Persona | null
  showButton?: boolean
  freshProfile?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const isEditing = !!persona

  const defaultValues = useMemo(() => {
    return {
      name: persona?.display_name || '',
      prompt: persona?.prompt || '',
      model: persona?.model || '',
      temperature: persona?.temperature || 0.7,
      messaging_platform: {
        is_imessage_persona: persona?.is_imessage_persona ?? freshProfile,
        is_telegram_persona: persona?.is_telegram_persona ?? freshProfile,
      },
    }
  }, [persona, freshProfile])

  const form = useForm<PersonaFormValues>({
    resolver: zodResolver(personaFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  useEffect(() => {
    if (open || freshProfile) {
      form.reset(defaultValues)
    }
  }, [open, freshProfile, defaultValues, form])

  const handleOpenChange = (isOpen: boolean) => {
    if (freshProfile && !isOpen) {
      return
    }
    setOpen(isOpen)
  }

  const onSubmit = async (data: PersonaFormValues) => {
    setIsSaving(true)

    await toast.promise(
      savePersona({
        id: persona?.id ?? uuidv4(),
        user_id: user.id,
        display_name: data.name,
        prompt: data.prompt,
        model: data.model,
        temperature: data.temperature,
        is_imessage_persona: data.messaging_platform.is_imessage_persona,
        is_telegram_persona: data.messaging_platform.is_telegram_persona,
      })
        .then(result => {
          handleOpenChange(false)
          router.refresh()
          return result
        })
        .catch(err => {
          console.error(`Error saving persona:`, err)
          throw err
        })
        .finally(() => {
          setIsSaving(false)
        }),
      {
        loading: 'Saving contact...',
        success: 'Contact saved successfully!',
        error: err => `Failed to save contact: ${err.message || 'unknown error.'}`,
      }
    )
  }

  const trigger = isEditing ? (
    <PersonaAvatar
      personaId={persona.id}
      personaName={persona.display_name}
      onClick={() => setOpen(true)}
    />
  ) : (
    showButton && (
      <Label onClick={() => setOpen(true)} className="cursor-pointer">
        <span>Add Contact</span>
        <Plus className="w-4 h-4" />
      </Label>
    )
  )

  return (
    <>
      {trigger}
      <Credenza open={open || freshProfile} onOpenChange={handleOpenChange} preventClose={freshProfile}>
        <CredenzaContent showCloseButton={!freshProfile}>
          <CredenzaHeader>
            <CredenzaTitle>{isEditing ? 'Edit Contact' : 'Add New Contact'}</CredenzaTitle>
          </CredenzaHeader>
          <CredenzaBody>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} id="persona-form" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Their name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="google/gemini-2.5-flash" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>System Prompt</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={6} placeholder="The system prompt for the contact" className="resize-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperature</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" max="2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <FormField
                  control={form.control}
                  name="messaging_platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Messaging Platforms</FormLabel>
                      <FormControl>
                        <MessagingPlatformField value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormDescription>
                        What platforms can they use to message you?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CredenzaBody>
          <CredenzaFooter>
            <div className="flex w-full gap-4 justify-between">
              <div>
                {isEditing && (
                  <PersonaDestructiveButton
                    personaId={persona.id}
                    setEditingPersonaId={() => handleOpenChange(false)}
                  />
                )}
              </div>
              <Button
                type="submit"
                form="persona-form"
                disabled={isSaving || !form.formState.isDirty}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>
    </>
  )
}

export function PersonaDestructiveButton({
  personaId,
  setEditingPersonaId,
}: {
  personaId: string
  setEditingPersonaId: (id: string | null) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  async function handleDelete() {
    setIsOpen(false)
    await deletePersona(personaId)
    setEditingPersonaId(null)
    router.push('/chat/0')
    router.refresh()
  }
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive"> Delete </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {' '}
            This cannot be undone. This will permanently delete this persona and all associated
            messages, memories and images from our servers.{' '}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleDelete}> Delete </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
