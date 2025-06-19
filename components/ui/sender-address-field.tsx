import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ControlGroup, ControlGroupItem } from '@/components/ui/control-group'
import { useState } from 'react'
import { Input } from './input'
import { PhoneInput } from '@/components/ui/phone-input'

export function SenderAddressField({
  value,
  onChange,
}: {
  value: string | null
  onChange: (value: string | null) => void
}) {
  const [isEmail, setIsEmail] = useState(value?.includes('@') ?? false)
  const [emailValue, setEmailValue] = useState(value?.includes('@') ? value : '')
  const [phoneValue, setPhoneValue] = useState(!value?.includes('@') ? value : '')

  const handleTypeChange = (newType: string) => {
    const newIsEmail = newType === 'email'
    setIsEmail(newIsEmail)
    // When switching types, use the stored value for that type
    onChange(newIsEmail ? emailValue || null : phoneValue || null)
  }

  const handleInputChange = (newValue: string) => {
    if (isEmail) {
      setEmailValue(newValue)
      if (newValue.includes('@') && newValue.includes('.')) {
        onChange(newValue)
      } else {
        onChange(null)
      }
    } else {
      setPhoneValue(newValue)
      onChange(newValue || null)
    }
  }

  return (
    <ControlGroup className="w-full">
      <Select defaultValue={isEmail ? 'email' : 'phone'} onValueChange={handleTypeChange}>
        <ControlGroupItem>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Email or Phone" />
          </SelectTrigger>
        </ControlGroupItem>
        <SelectContent>
          <SelectItem value="phone">Phone</SelectItem>
          <SelectItem value="email">Email</SelectItem>
        </SelectContent>
      </Select>
      <ControlGroupItem>
        {isEmail ? (
          <Input
            type="email"
            placeholder=""
            value={emailValue}
            onChange={(e) => handleInputChange(e.target.value)}
          />
        ) : (
          <PhoneInput
            international
            countryCallingCodeEditable={true}
            defaultCountry="US"
            value={phoneValue || ''}
            onChange={(newValue) => handleInputChange(newValue)}
            className="w-full"
          />
        )}
      </ControlGroupItem>
    </ControlGroup>
  )
}
