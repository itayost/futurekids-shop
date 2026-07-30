// CSV export of the club members list (pure, testable). Prefixed with a BOM
// so Hebrew renders correctly when Excel opens the file.

export interface MemberCsvRow {
  email: string;
  first_name: string | null;
  created_at: string;
  unsubscribed_at: string | null;
}

function escapeCsvField(value: string): string {
  // Excel executes leading =, +, -, @ (and tab/CR) as formulas - neutralize
  // so a member-supplied name cannot run code when the export is opened.
  const guarded = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  if (/[",\n\r]/.test(guarded)) {
    return `"${guarded.replace(/"/g, '""')}"`;
  }
  return guarded;
}

export function buildMembersCsv(members: MemberCsvRow[]): string {
  const header = ['אימייל', 'שם פרטי', 'תאריך הצטרפות', 'סטטוס'];
  const lines = members.map((m) =>
    [
      m.email,
      m.first_name || '',
      new Date(m.created_at).toLocaleDateString('he-IL'),
      m.unsubscribed_at ? 'הוסר' : 'פעיל',
    ]
      .map(escapeCsvField)
      .join(',')
  );
  return '﻿' + [header.join(','), ...lines].join('\r\n');
}
