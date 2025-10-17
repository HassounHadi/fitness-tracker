import { cn } from "@/lib/utils";

type TitleSize = "t1" | "t2" | "t3" | "t4" | "t5" | "t6";
type DescriptionSize = "p1" | "p2" | "p3";

interface SectionHeaderProps {
  title: string;
  description?: string;
  titleSize?: TitleSize;
  descriptionSize?: DescriptionSize;
  titleClassName?: string;
  descriptionClassName?: string;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  titleSize = "t3",
  descriptionSize = "p1",
  titleClassName,
  descriptionClassName,
  className,
}: SectionHeaderProps) {
  return (
    <div className={className}>
      <h1 className={cn(titleSize, "text-primary", titleClassName)}>
        {title}
      </h1>
      {description && (
        <p className={cn(descriptionSize, "text-accent mt-2", descriptionClassName)}>
          {description}
        </p>
      )}
    </div>
  );
}
