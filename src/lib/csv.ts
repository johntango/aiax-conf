export const toCSV = (rows: any[]): string => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes("\n") || s.includes("\"")
      ? '"' + s.replace(/"/g, '""') + '"'
      : s;
  };
  return [headers.join(","), ...rows.map(r => headers.map(h => esc((r as any)[h])).join(","))].join("\n");
};
