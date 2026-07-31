"use client";

import { GripVertical } from "lucide-react";
import { useCallback, useState } from "react";

import { cn } from "@/lib/cn";

/**
 * Drag-and-drop reordering for admin lists.
 *
 * Replaces the manual "display order" number fields: you drag a row where you
 * want it instead of guessing an index and hoping nothing else collides.
 *
 * Built on the native HTML5 drag API so it adds no dependency. Dragging is
 * mouse/touch-pen only by nature, so every handle also exposes keyboard moves
 * (arrow up/down while focused) — otherwise reordering becomes unreachable for
 * anyone not using a pointer.
 */

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

interface ItemProps {
  draggable: boolean;
  onDragStart: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (event: React.DragEvent) => void;
  "data-dragging": boolean | undefined;
  "data-drop-target": boolean | undefined;
}

export function useReorder<T>({
  items,
  onReorder,
  disabled = false,
}: {
  items: T[];
  onReorder: (next: T[], from: number, to: number) => void;
  disabled?: boolean;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const move = useCallback(
    (from: number, to: number) => {
      if (from === to) return;
      const next = moveItem(items, from, to);
      if (next !== items) onReorder(next, from, to);
    },
    [items, onReorder],
  );

  const getItemProps = useCallback(
    (index: number): ItemProps => ({
      draggable: !disabled,
      onDragStart: (event) => {
        if (disabled) return;
        setDragIndex(index);
        event.dataTransfer.effectAllowed = "move";
        // Firefox refuses to start a drag without payload.
        event.dataTransfer.setData("text/plain", String(index));
      },
      onDragOver: (event) => {
        if (disabled || dragIndex === null) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setOverIndex(index);
      },
      onDragEnd: () => {
        setDragIndex(null);
        setOverIndex(null);
      },
      onDrop: (event) => {
        if (disabled || dragIndex === null) return;
        event.preventDefault();
        move(dragIndex, index);
        setDragIndex(null);
        setOverIndex(null);
      },
      "data-dragging": dragIndex === index || undefined,
      "data-drop-target": (overIndex === index && dragIndex !== index) || undefined,
    }),
    [disabled, dragIndex, move, overIndex],
  );

  return { dragIndex, overIndex, getItemProps, move };
}

/**
 * The grab handle. Owns the keyboard affordance so callers get it for free.
 */
export function DragHandle({
  label,
  index,
  count,
  onMove,
  disabled = false,
  className,
}: {
  /** Name of the thing being moved, for screen readers. */
  label: string;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={`Reorder ${label}. Position ${index + 1} of ${count}. Use arrow up and arrow down to move.`}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp" && index > 0) {
          event.preventDefault();
          onMove(index, index - 1);
        } else if (event.key === "ArrowDown" && index < count - 1) {
          event.preventDefault();
          onMove(index, index + 1);
        }
      }}
      className={cn(
        "grid h-8 w-6 shrink-0 cursor-grab place-items-center rounded-md text-fg-subtle transition-colors hover:bg-surface-sunken hover:text-fg focus:outline-none focus:ring-2 focus:ring-accent-ring active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
        className,
      )}
    >
      <GripVertical size={15} aria-hidden />
    </button>
  );
}

/** Shared visual states for a row inside a reorderable list. */
export const sortableRowClass =
  "transition-[opacity,box-shadow] data-[dragging]:opacity-40 data-[drop-target]:shadow-[inset_0_2px_0_0_var(--color-accent)]";
