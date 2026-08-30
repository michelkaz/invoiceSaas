import { cn } from "@/lib/utils";

export function Table({
  minWidth = 640,
  className,
  children,
}: {
  minWidth?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn("w-full text-left text-sm", className)}
        style={{ minWidth }}
      >
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
        {children}
      </tr>
    </thead>
  );
}

export function TH({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <th className={cn("px-5 py-3.5 font-semibold", className)}>{children}</th>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function TR({
  onClick,
  className,
  children,
}: {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "transition-colors",
        onClick && "cursor-pointer hover:bg-slate-50/70",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TD({
  className,
  colSpan,
  children,
}: {
  className?: string;
  colSpan?: number;
  children?: React.ReactNode;
}) {
  return (
    <td colSpan={colSpan} className={cn("px-5 py-4", className)}>
      {children}
    </td>
  );
}
