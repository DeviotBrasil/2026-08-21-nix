type StatusMessageProps = {
  id?: string;
  tone: "error" | "empty" | "info";
  children: string;
};

export function StatusMessage({ id, tone, children }: StatusMessageProps) {
  const role = tone === "info" ? "status" : "alert";
  return (
    <p id={id} className={`status status-${tone}`} role={role}>
      {children}
    </p>
  );
}
