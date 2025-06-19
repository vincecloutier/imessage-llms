'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/custom/theme-provider'

import { saveProfile } from '@/lib/actions'
import { Profile, User } from '@/lib/types'
import { ChevronsUpDown, UserIcon } from 'lucide-react'
import { signOut } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaBody,
} from '@/components/ui/credenza'
import { Input } from '@/components/ui/input'

const profileFormSchema = z.object({
  display_name: z.string().min(1, 'Display name is required!'),
  imessage_address: z.string().optional(),
  telegram_address: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm({ user, profile }: { user: User; profile: Profile | null }) {
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const forceAnswer = !profile

  async function handleSignOut() {
    await signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  const defaultValues = useMemo(
    () => ({
      display_name: profile?.display_name || '',
      imessage_address: profile?.imessage_address || '',
      telegram_address: profile?.telegram_address || '',
    }),
    [profile]
  )

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  useEffect(() => {
    if (open || forceAnswer) {
      form.reset(defaultValues)
    }
  }, [open, forceAnswer, defaultValues, form])

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true)

    await toast.promise(
      saveProfile({
        id: user.id,
        display_name: data.display_name,
        imessage_address: data.imessage_address || null,
        telegram_address: data.telegram_address || null,
      })
        .then(result => {
          setOpen(false)
          router.refresh()
          return result
        })
        .catch(err => {
          console.error(`Error saving profile:`, err)
          throw err
        })
        .finally(() => {
          setIsSaving(false)
        }),
      {
        loading: 'Saving profile...',
        success: 'Profile saved successfully!',
        error: err => `Failed to save profile: ${err.message || 'unknown error.'}`,
      }
    )
  }

  const handleOpenChange = (newOpenState: boolean) => {
    if (forceAnswer && !newOpenState) {
      return
    }
    setOpen(newOpenState)
  }

  return (
    <>
      {profile && (
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-muted px-4 h-12"
          onClick={() => setOpen(true)}
        >
          <Avatar className="size-8 rounded-lg bg-indigo-600 text-white overflow-hidden">
            <AvatarFallback className="rounded-lg bg-transparent">
              <UserIcon />
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">Profile</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
        </div>
      )}

      <Credenza open={open || forceAnswer} onOpenChange={handleOpenChange} preventClose={forceAnswer}>
        <CredenzaContent showCloseButton={!forceAnswer}>
          <CredenzaHeader>
            <CredenzaTitle>Profile</CredenzaTitle>
            <CredenzaDescription>
              Your profile will not be passed to the personas, and can be changed at any time.
            </CredenzaDescription>
          </CredenzaHeader>
          <CredenzaBody>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} id="profile-form" className="space-y-4">
                <FormField
                  control={form.control}
                  name="display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Display Name" />
                      </FormControl>
                      <FormDescription>
                        The name you want to display for the interface.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imessage_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>iMessage Address (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1234567890" />
                      </FormControl>
                      <FormDescription>
                        Please format your number as demonstrated above. If you are using an email with iMessages, please include the entire email address (with @).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telegram_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telegram Username (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="johndoe" />
                      </FormControl>
                      <FormDescription>
                        Please omit the @ symbol.
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
              <Button variant="outline" onClick={handleSignOut}>
                Exit
              </Button>
			  <ThemeToggle />
              <Button
                type="submit"
                form="profile-form"
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
