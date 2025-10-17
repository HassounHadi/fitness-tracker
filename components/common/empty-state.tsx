"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

type EmptyStateVariant = "simple" | "featured" | "with-icon";

interface EmptyStateAction {
  label: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg";
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  variant?: EmptyStateVariant;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "with-icon",
  className,
}: EmptyStateProps) {
  const renderAction = () => {
    if (!action) return null;

    const ActionIcon = action.icon;
    const buttonContent = (
      <>
        {ActionIcon && <ActionIcon className="h-4 w-4 md:h-5 md:w-5" />}
        {action.label}
      </>
    );

    const buttonProps = {
      className: "gap-2",
      variant: action.variant || "default",
      size: action.size || "default",
    };

    if (action.href) {
      return (
        <Link href={action.href}>
          <Button {...buttonProps}>{buttonContent}</Button>
        </Link>
      );
    }

    return (
      <Button {...buttonProps} onClick={action.onClick}>
        {buttonContent}
      </Button>
    );
  };

  // Simple variant - minimal text-only
  if (variant === "simple") {
    return (
      <div className={cn("text-center py-12", className)}>
        <h3 className="t5 font-semibold text-primary mb-2">{title}</h3>
        <p className="p1 text-muted-foreground">{description}</p>
        {action && <div className="mt-4">{renderAction()}</div>}
      </div>
    );
  }

  // Featured variant - with glowing background effect
  if (variant === "featured" && Icon) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-16 px-4",
          className
        )}
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
          <div className="relative bg-primary/10 p-6 rounded-full">
            <Icon className="h-12 w-12 text-primary" />
          </div>
        </div>

        <h2 className="t3 text-primary mb-2">{title}</h2>
        <p className="text-accent text-center mb-6 max-w-md">{description}</p>

        {renderAction()}
      </div>
    );
  }

  // With-icon variant - simple icon with text
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center flex-1 px-6 py-12 text-center",
        className
      )}
    >
      {Icon && <Icon className="h-12 w-12 mb-4" />}
      <p className="t5 font-semibold mb-2 text-primary">{title}</p>
      <p className="p3 text-accent max-w-md">{description}</p>
      {action && <div className="mt-4">{renderAction()}</div>}
    </div>
  );
}
