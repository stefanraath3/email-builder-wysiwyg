"use client";

import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { type SlashCommandItem } from "@/lib/slash-command-extension";
import { cn } from "@/lib/utils";

interface SlashCommandProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  editor: any;
}

export interface SlashCommandRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SlashCommandList = forwardRef<SlashCommandRef, SlashCommandProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const commandListRef = useRef<HTMLDivElement>(null);

    const scrollToItem = (index: number) => {
      const item = commandListRef.current?.children[index] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    };

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((index) => {
            const newIndex = index > 0 ? index - 1 : items.length - 1;
            scrollToItem(newIndex);
            return newIndex;
          });
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((index) => {
            const newIndex = index < items.length - 1 ? index + 1 : 0;
            scrollToItem(newIndex);
            return newIndex;
          });
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    return (
      <Command className="w-[300px] rounded-lg border shadow-md">
        <CommandList ref={commandListRef}>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.title}
                  value={item.title}
                  onSelect={() => selectItem(index)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 cursor-pointer",
                    selectedIndex === index && "bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    );
  }
);

SlashCommandList.displayName = "SlashCommandList";

export const SlashCommand = forwardRef<SlashCommandRef, SlashCommandProps>(
  ({ items, command, editor }, ref) => {
    return (
      <SlashCommandList
        ref={ref}
        items={items}
        command={command}
        editor={editor}
      />
    );
  }
);

SlashCommand.displayName = "SlashCommand";
