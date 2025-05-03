import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchLocation } from "@/lib/actions";
import { Loader2, Search } from "lucide-react";

interface LocationFieldProps {
    value: any;
    onChange: (val: any) => void;
  }
  
export const LocationField: React.FC<LocationFieldProps> = ({ value, onChange }) => {
    const [locationInputText, setLocationInputText] = useState(value?.name || "");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSearching, setIsSearching] = useState(false);
  
    const handleLocationSearch = useCallback(async () => {
        if (locationInputText.length < 3) {
            setErrorMessage("Please enter at least 3 characters");
            return;
        }
        setIsSearching(true);
        const result = await searchLocation(locationInputText);
        if (result && !result.error) {
            onChange(result);
            setLocationInputText(result.name || "");
            setErrorMessage("");
        } else {
            setErrorMessage(result.error || "Failed to fetch location. Please try again.");
            onChange(null);
        }
        setIsSearching(false);
    }, [locationInputText, onChange]);
  
    useEffect(() => {if (value && value.name) setLocationInputText(value.name)}, [value]);
  
    return (
      <div className="flex flex-col gap-2">
        <div className="relative flex items-center">
          <Input
            type="text"
            value={locationInputText}
            onChange={e => setLocationInputText(e.target.value)}
            placeholder="Toronto, Ontario, Canada"
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleLocationSearch();
              }
            }}
            autoComplete="off"
          />
          <Button type="button" size="icon" variant="ghost" onClick={handleLocationSearch} disabled={isSearching}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-primary">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
      </div>
    );
  };
  