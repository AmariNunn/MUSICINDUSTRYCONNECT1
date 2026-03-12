import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import citiesData from "@/data/cities.json";

interface City {
  city: string;
  state: string;
  country: string;
}

const cities = citiesData as City[];

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationPicker({ value, onChange, placeholder = "Select your location", className }: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCities = useMemo(() => {
    if (!search || search.length < 2) return [];
    const searchLower = search.toLowerCase();
    return cities
      .filter(city => 
        city.city.toLowerCase().includes(searchLower) ||
        city.state.toLowerCase().includes(searchLower) ||
        city.country.toLowerCase().includes(searchLower)
      )
      .slice(0, 100);
  }, [search]);

  const formatLocation = (city: City) => {
    if (city.state) {
      return `${city.city}, ${city.state}, ${city.country}`;
    }
    return `${city.city}, ${city.country}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between border-purple-200 focus:border-purple-400 focus:ring-purple-200 bg-white rounded-xl text-left font-normal h-auto py-3",
            !value && "text-gray-400",
            value && "text-gray-900",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-4 h-4 text-[#c084fc] shrink-0" />
            <span className="truncate">{value || placeholder}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 max-w-[400px]" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Type to search cities..." 
            value={search}
            onValueChange={setSearch}
            className="border-0"
          />
          <CommandList>
            {search.length < 2 ? (
              <CommandEmpty className="py-6 text-center text-sm text-gray-500">
                Type at least 2 characters to search...
              </CommandEmpty>
            ) : filteredCities.length === 0 ? (
              <CommandEmpty>No cities found.</CommandEmpty>
            ) : (
              <CommandGroup className="max-h-[300px] overflow-auto">
                {filteredCities.map((city, index) => {
                  const locationString = formatLocation(city);
                  return (
                    <CommandItem
                      key={`${city.city}-${city.state}-${city.country}-${index}`}
                      value={locationString}
                      onSelect={() => {
                        onChange(locationString);
                        setOpen(false);
                        setSearch("");
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === locationString ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{city.city}</span>
                        <span className="text-xs text-gray-500">
                          {city.state ? `${city.state}, ${city.country}` : city.country}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
