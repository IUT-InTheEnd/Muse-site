import * as React from "react"

import { cn } from "@/lib/utils"
import { cva, VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

const CardVariants = cva(
  "flex flex-col rounded-xl overflow-hidden",
  {
    variants: {
      type: {
        media: "gap-2",  // musique ou album  
        playlist: "justify-center",  
        envies: "justify-center",
        artist: "items-center text-center gap-3", 
      },
      variant: {
        musique: "bg-music-card",
        album: "bg-album-card",
        artist: "bg-artist-card",
        playlist: "bg-playlist-card",
        envies: "bg-envies-card",
      }
    },
    defaultVariants: {
      type: "media",
      variant: "musique",
    },
  }
)


function Card({
  className,
  asChild = false,
  variant,
  type,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof CardVariants> & {
    asChild?: boolean
  }) {

  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      data-slot="card"
      className={cn(
        CardVariants({ variant, type }),
        "group transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  )
}


function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardSubtitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-subtitle"
      className={cn("text-sm", className)}
      {...props}
    />
  )
}

function CardIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-icon"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardCover({
  className,
  rounded = false,
  ...props
}: React.ComponentProps<"img"> & { rounded?: boolean }) {
  return (
    <img
      className={cn(
        "w-full aspect-square object-cover",
        rounded && "rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Card, CardVariants, CardTitle, CardSubtitle, CardIcon, CardContent, CardCover }
