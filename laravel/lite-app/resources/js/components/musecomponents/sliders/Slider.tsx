import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";



type SliderProps = {
  title?: string
  children: React.ReactNode[]
  className?: string
}


function useVisibleCards() {
  const [visible, setVisible] = React.useState(4)

  React.useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        setVisible(1)
      } else if (window.innerWidth < 1024) {
        setVisible(2)
      } else if (window.innerWidth < 1280) {
        setVisible(3)
      } else {
        setVisible(4)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return visible
}


export function Slider({
  title,
  children,
  className,
}: SliderProps) {
  const visible = useVisibleCards()
  const [index, setIndex] = React.useState(0)
  const items = React.Children.toArray(children)
  const total = items.length

  const maxIndex = Math.max(0, total - visible)

  const prev = () =>
    setIndex((i) => Math.max(i - 1, 0))

  const next = () =>
    setIndex((i) => Math.min(i + 1, maxIndex))

  const isFirst = index === 0
  const isLast = index === maxIndex

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between px-1">
        {title && (
          <h2 className="text-lg font-semibold">
            {title}
          </h2>
        )}

        <div className="flex gap-2">
          <button onClick={prev} disabled={isFirst}>
            <ChevronLeft />
          </button>
          <button onClick={next} disabled={isLast}>
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative w-full max-w-7xl mx-auto overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${(100 / visible) * index}%)`,
          }}
        >
          {React.Children.map(children, (child, i) => (
            <div key={i} className="flex-shrink-0 px-3 w-[80%] sm:w-[45%] lg:w-[23%]">
              {child}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
