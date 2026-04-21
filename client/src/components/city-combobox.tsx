import { useMemo, useState } from "react";
import { Check, ChevronDown, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import citiesData from "@/data/cities.json";

type CityRow = { c: string; s: string; n: string; i: string };

const CITIES = citiesData as CityRow[];

const ALL = "all";

function normalize(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function labelFor(row: CityRow) {
  if (row.i === "US" && row.s) return `${row.c}, ${row.s}`;
  if (row.s) return `${row.c}, ${row.s}, ${row.n}`;
  return `${row.c}, ${row.n}`;
}

interface CityComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CityCombobox({
  value,
  onChange,
  placeholder = "All Cities",
  className,
}: CityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = normalize(query);
    if (!q) {
      return CITIES.filter((r) => r.i === "US").slice(0, 100);
    }
    const tokens = q.split(" ").filter(Boolean);
    const out: CityRow[] = [];
    for (const r of CITIES) {
      const hay = normalize(`${r.c} ${r.s} ${r.n} ${r.i}`);
      if (tokens.every((t) => hay.includes(t))) {
        out.push(r);
        if (out.length >= 100) break;
      }
    }
    return out;
  }, [query]);

  const triggerLabel = value === ALL ? placeholder : value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          data-testid="select-city"
          className={cn(
            "w-full justify-between bg-white border-purple-300 text-gray-700 rounded-full h-10 sm:h-11 text-sm font-normal shadow-sm hover:border-purple-400 hover:bg-white hover:text-gray-700 transition-all",
            value === ALL && "text-gray-500",
            className,
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="truncate">{triggerLabel}</span>
          </span>
          <span className="flex items-center gap-1">
            {value !== ALL && (
              <span
                role="button"
                tabIndex={0}
                data-testid="button-clear-city"
                className="rounded-full p-0.5 hover:bg-purple-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(ALL);
                  setQuery("");
                }}
              >
                <X className="w-3.5 h-3.5 text-purple-400" />
              </span>
            )}
            <ChevronDown className="w-4 h-4 text-purple-400 shrink-0" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[--radix-popover-trigger-width] min-w-[260px] bg-white border-purple-200 shadow-lg"
        align="start"
      >
        <Command shouldFilter={false} className="bg-white">
          <CommandInput
            data-testid="input-city-search"
            placeholder="Search cities..."
            value={query}
            onValueChange={setQuery}
            className="text-gray-700"
          />
          <CommandList className="max-h-72">
            <CommandEmpty>No cities found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__all__"
                data-testid="option-city-all"
                onSelect={() => {
                  onChange(ALL);
                  setQuery("");
                  setOpen(false);
                }}
                className="text-gray-700 hover:bg-purple-50 data-[selected=true]:bg-purple-100"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === ALL ? "opacity-100 text-purple-600" : "opacity-0",
                  )}
                />
                All Cities
              </CommandItem>
              {matches.map((row, idx) => {
                const lbl = labelFor(row);
                return (
                  <CommandItem
                    key={`${row.c}-${row.s}-${row.n}-${idx}`}
                    value={lbl}
                    data-testid={`option-city-${idx}`}
                    onSelect={() => {
                      onChange(lbl);
                      setOpen(false);
                    }}
                    className="text-gray-700 hover:bg-purple-50 data-[selected=true]:bg-purple-100"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === lbl ? "opacity-100 text-purple-600" : "opacity-0",
                      )}
                    />
                    {lbl}
                  </CommandItem>
                );
              })}
              {matches.length >= 100 && (
                <div className="px-3 py-2 text-xs text-gray-400">
                  Showing first 100 matches — keep typing to narrow.
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
