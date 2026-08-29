import { SHOW_TODOS } from "@/lib/site";

/**
 * Marks a fact awaiting RG's sign-off. Renders the last-known value always;
 * appends an amber chip unless NEXT_PUBLIC_SHOW_TODOS=false.
 */
export function Confirm({
  q,
  children,
}: {
  q: string;
  children: React.ReactNode;
}) {
  if (!SHOW_TODOS) return <>{children}</>;
  return (
    <>
      {children}{" "}
      <span className="todo-chip" title={q} aria-label={`To confirm: ${q}`}>
        confirm
      </span>
    </>
  );
}
