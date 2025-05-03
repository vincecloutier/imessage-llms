
import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchLocation } from "@/lib/actions";

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
        setErrorMessage("Searching...");
        const result = await searchLocation(locationInputText);
        if (result && !result.error) {
            onChange(result);
            setLocationInputText(result.name || "");
            setErrorMessage("");
        } else {
            setErrorMessage(result.error || "No matching location found");
            onChange(null);
        }
        setIsSearching(false);
    }, [locationInputText, onChange]);
  
    useEffect(() => {if (value && value.name) setLocationInputText(value.name)}, [value]);
  
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            type="text"
            value={locationInputText}
            onChange={e => setLocationInputText(e.target.value)}
            placeholder="Enter location name"
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleLocationSearch();
              }
            }}
          />
          <Button type="button" onClick={handleLocationSearch} disabled={isSearching}>
            Search
          </Button>
        </div>
        {errorMessage && <p className="text-sm">{errorMessage}</p>}
      </div>
    );
  };
  