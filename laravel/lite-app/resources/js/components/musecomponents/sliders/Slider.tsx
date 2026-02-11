import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";



type SliderProps = {
  title?: string
  children: React.ReactNode[]
  className?: string
}

export function Slider({
  title,
  children,
  className,
}: SliderProps) {
  const [index, setIndex] = React.useState(0)
  const total = children.length

  const prev = () =>
    setIndex((i) => (i === 0 ? total - 1 : i - 1))

  const next = () =>
    setIndex((i) => (i === total - 4 ? 0 : i + 1))

  const isFirst = index === 0
  const isLast = index === total - 4

  return (
    <section className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        {title && (
          <h2 className="text-lg font-semibold">
            {title}
          </h2>
        )}

        <div className="flex gap-2">
          <button
            onClick={prev}
            disabled={isFirst}
            className={cn(
              "h-8 w-8 rounded-full border border-foreground flex items-center justify-center",
              isFirst
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-primary"
            )}
          >
            <ChevronLeft />
          </button>

          <button
            onClick={next}
            disabled={isLast}
            className={cn(
              "h-8 w-8 rounded-full border border-foreground flex items-center justify-center",
              isLast
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-primary"
            )}
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative w-full max-w-7xl mx-auto overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 25}%)` }}
        >
          {children.map((child, i) => (
            <div key={i} className="w-full flex-shrink-1 px-3">
              {child}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
