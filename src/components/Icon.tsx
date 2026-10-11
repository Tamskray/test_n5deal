// src/components/ui/Icon/Icon.tsx
import * as LucideIcons from "lucide-react";
import { tv, type VariantProps } from "tailwind-variants";

export const iconVariants = tv({
  base: "shrink-0 transition-colors",
  variants: {
    size: {
      xs: "size-3.5", // 14px
      sm: "size-4", // 16px
      md: "size-5", // 20px
      lg: "size-6", // 24px
      xl: "size-8", // 32px
    },
    color: {
      primary: "text-blue-600",
      error: "text-red-600",
      success: "text-green-600",
      muted: "text-gray-400",
      current: "text-current",
    },
  },
  defaultVariants: {
    // size: "sm",  // default size moved to props
    color: "current",
  },
});

export type IconName = keyof typeof LucideIcons;

export interface IconProps extends VariantProps<typeof iconVariants> {
  name: IconName;
  className?: string;
  strokeWidth?: number;
  customSize?: number;
}

export const Icon = ({
  name,
  size = "sm", // default size
  customSize,
  color,
  className,
  strokeWidth = 2,
}: IconProps) => {
  // Lucide types their exports as LucideIcon
  const IconComponent = LucideIcons[name] as LucideIcons.LucideIcon;

  const hasCustomSize = typeof customSize === "number" && customSize > 0;

  return (
    <IconComponent
      size={customSize}
      className={iconVariants({ ...(hasCustomSize ? {} : { size }), color, className })}
      strokeWidth={strokeWidth}
    />
  );
};
