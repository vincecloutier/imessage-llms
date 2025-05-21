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

  useEffect(() => {
    if (value) {
      setIsEmail(value.includes('@'));
      setInputValue(value);
    }
  }, [value]);

  const handleTypeChange = (newType: string) => {
    setIsEmail(newType === 'email');
    setInputValue('');
    onChange(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (isEmail) {
      setInputValue(newValue);
      // Email validation
      if (newValue.includes('@') && newValue.includes('.')) {
        onChange(newValue);
      } else {
        onChange(null);
      }
    } else {
      // Phone validation - only allow numbers and +
      const sanitizedValue = newValue.replace(/[^0-9+]/g, '');
      // Ensure it starts with +
      const finalValue = sanitizedValue.startsWith('+') ? sanitizedValue : '+' + sanitizedValue;
      setInputValue(finalValue);

      if (finalValue.length > 1) { // More than just the + symbol
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
          <SelectTrigger className="w-fit">
            <SelectValue placeholder="Email or Phone" />
          </SelectTrigger>
        </ControlGroupItem>
        <SelectContent align="end">
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="phone">Phone</SelectItem>
        </SelectContent>
      </Select>
      <ControlGroupItem>
        <Input              type={isEmail ? "email" : "tel"}
              placeholder={isEmail ? "Enter email" : "Enter phone number"}
              value={inputValue}
              onChange={handleInputChange}
              pattern={isEmail ? undefined : "^\\+[0-9]+$"}
            />
      </ControlGroupItem>
    </ControlGroup>
  );
}