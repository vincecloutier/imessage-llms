import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ControlGroup,
  ControlGroupItem,
} from "@/components/ui/control-group";
import { useState, useEffect } from "react";
import { Input } from "./input";

export function SenderAddressField({value, onChange}: {value: string | null, onChange: (value: string | null) => void}) {
  const [isEmail, setIsEmail] = useState(value?.includes('@') ?? false);
  const [inputValue, setInputValue] = useState(value ?? '');
  const [emailValue, setEmailValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');

  useEffect(() => {
    if (value) {
      const isEmailValue = value.includes('@');
      setIsEmail(isEmailValue);
      setInputValue(value);
      if (isEmailValue) {
        setEmailValue(value);
      } else {
        setPhoneValue(value);
      }
    }
  }, [value]);

  const handleTypeChange = (newType: string) => {
    const newIsEmail = newType === 'email';
    setIsEmail(newIsEmail);
    setInputValue(newIsEmail ? emailValue : phoneValue);
    const currentValue = newIsEmail ? emailValue : phoneValue;
    if (currentValue) {
      onChange(currentValue);
    } else {
      onChange(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (isEmail) {
      setInputValue(newValue);
      setEmailValue(newValue);
      if (newValue.includes('@') && newValue.includes('.')) {
        onChange(newValue);
      } else {
        onChange(null);
      }
    } else {
      const sanitizedValue = newValue.replace(/[^0-9+]/g, '');
      const finalValue = sanitizedValue.startsWith('+') ? sanitizedValue : '+' + sanitizedValue;
      setInputValue(finalValue);
      setPhoneValue(finalValue);

      if (finalValue.length > 1) {
        onChange(finalValue);
      } else {
        onChange(null);
      }
    }
  };

  return (
    <ControlGroup className="w-full">
      <Select 
        defaultValue={isEmail ? "email" : "phone"} 
        onValueChange={handleTypeChange}
      >
        <ControlGroupItem>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Email or Phone" />
          </SelectTrigger>
        </ControlGroupItem>
        <SelectContent align="end">
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="phone">Phone</SelectItem>
        </SelectContent>
      </Select>
      <ControlGroupItem>
        <Input
          type={isEmail ? "email" : "tel"}
          placeholder={""}
          value={inputValue}
          onChange={handleInputChange}
          pattern={isEmail ? undefined : "^\\+[0-9]+$"}
        />
      </ControlGroupItem>
    </ControlGroup>
  );
}