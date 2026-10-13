import { initials } from "@/lib/format";

export function Avatar({
  name,
  size = "sm",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-9 w-9 text-[12px]",
    lg: "h-12 w-12 text-[15px]",
  } as const;
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-pill bg-accent-100 font-semibold text-accent-700 ${sizes[size]}`}
    >
      {initials(name)}
    </span>
  );
}
