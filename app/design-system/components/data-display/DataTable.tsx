import { colors, spacing } from '~/design-system/tokens';

interface Column<T> {
  key: keyof T;
  label: string;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'Nenhum dado disponível',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <p
        style={{
          textAlign: 'center',
          color: colors.gray600,
          padding: spacing.lg,
          fontSize: '14px',
        }}
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: `2px solid ${colors.gray300}`,
              backgroundColor: colors.gray100,
            }}
          >
            {columns.map((col) => (
              <th
                key={String(col.key)}
                style={{
                  padding: spacing.md,
                  textAlign: 'left',
                  fontWeight: 600,
                  color: colors.gray900,
                  width: col.width,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              onClick={() => onRowClick?.(row)}
              style={{
                borderBottom: `1px solid ${colors.gray300}`,
                cursor: onRowClick ? 'pointer' : 'default',
                backgroundColor: onRowClick ? colors.gray50 : 'transparent',
                transition: 'background-color 200ms ease',
              }}
              onMouseEnter={(e) => {
                if (onRowClick) {
                  e.currentTarget.style.backgroundColor = colors.gray100;
                }
              }}
              onMouseLeave={(e) => {
                if (onRowClick) {
                  e.currentTarget.style.backgroundColor = colors.gray50;
                }
              }}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  style={{
                    padding: spacing.md,
                    color: colors.gray900,
                  }}
                >
                  {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
