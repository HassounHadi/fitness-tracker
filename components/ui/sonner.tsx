"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-center"
      expand={false}
      closeButton
      toastOptions={{
        style: {
          position: "relative",
        },
        className: "font-sans !shadow-xl",
        classNames: {
          success: "!border-success !text-success !p3",
          error: "!border-error !text-error !p3",
          warning: "!border-warning !text-warning !p3",
          info: "!border-info !text-info !p3",
          closeButton:
            "!absolute !top-2 !right-2 !left-auto !w-7 !h-7 !transform-none !border-0 !text-secondary-foreground",
        },
      }}
      duration={5000}
      {...props}
    />
  );
};

export { Toaster };
