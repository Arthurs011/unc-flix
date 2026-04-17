import { Check, Server as ServerIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { STREAM_SERVERS, getServer } from "@/lib/servers";
import { cn } from "@/lib/utils";

interface ServerPickerProps {
  value: string;
  onChange: (id: string) => void;
}

export default function ServerPicker({ value, onChange }: ServerPickerProps) {
  const current = getServer(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 bg-secondary rounded-lg px-3 py-1.5 border border-border text-foreground text-sm hover:bg-secondary/80 transition-colors"
          data-testid="select-server"
        >
          <ServerIcon className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-base leading-none">{current.flag}</span>
          <span className="font-medium">{current.label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(92vw,560px)] p-3 bg-background/95 backdrop-blur-xl border-border"
      >
        <div className="mb-2 px-1 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Choose server</p>
          <p className="text-[10px] text-muted-foreground">{STREAM_SERVERS.length} sources</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {STREAM_SERVERS.map((s) => {
            const active = s.id === value;
            return (
              <button
                key={s.id}
                onClick={() => onChange(s.id)}
                className={cn(
                  "relative flex flex-col items-start justify-between gap-2 p-3 rounded-xl border text-left transition-all",
                  "bg-secondary/60 hover:bg-secondary border-border",
                  active && "border-primary bg-primary/15 ring-1 ring-primary/40",
                )}
              >
                <span className="text-lg leading-none">{s.flag}</span>
                <span className="text-sm font-semibold text-foreground truncate w-full">
                  {s.label}
                </span>
                {s.tag && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                    {s.tag}
                  </span>
                )}
                {active && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
