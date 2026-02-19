export default function DataTable({ columns, data, loading, onRowClick, emptyMessage = 'No data found' }) {
  if (loading) {
    return <div className="loading"><div className="loading-spinner" /></div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">📋</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key} style={col.headerStyle}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr
            key={row.id || i}
            onClick={() => onRowClick?.(row)}
            style={{ cursor: onRowClick ? 'pointer' : 'default' }}
          >
            {columns.map(col => (
              <td key={col.key} style={col.cellStyle}>
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
