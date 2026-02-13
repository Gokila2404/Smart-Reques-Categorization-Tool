export default function Categories() {
  const categories = [
    {
      name: "Networking",
      details: "Internet, WiFi, LAN, connectivity, portal access",
      owner: "Network Admin",
      response: "Same day to 1 working day",
    },
    {
      name: "Fees",
      details: "Payment status, due mismatch, receipt verification",
      owner: "Accounts Admin",
      response: "1-2 working days",
    },
    {
      name: "Discipline",
      details: "Behavior, misconduct, policy violation",
      owner: "Discipline Committee Admin",
      response: "1-3 working days",
    },
    {
      name: "General",
      details: "All other institutional requests",
      owner: "General Admin",
      response: "1-2 working days",
    },
  ];

  return (
    <div className="page">
      <div className="panel panel-body">
        <h2 style={{ marginTop: 0 }}>Category Rules</h2>
        <p className="subtext">
          Category mapping used by smart classification and assignment workflow.
        </p>

        <div className="stats-grid" style={{ marginTop: 12 }}>
          <div className="stat-card"><p>Total Categories</p><h3>{categories.length}</h3></div>
          <div className="stat-card"><p>Auto Classification</p><h3>Enabled</h3></div>
          <div className="stat-card"><p>Fallback Route</p><h3>General</h3></div>
          <div className="stat-card"><p>Routing Mode</p><h3>By Domain</h3></div>
        </div>

        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Common Issues</th>
                <th>Assigned To</th>
                <th>Expected Response</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.name}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.details}</td>
                  <td>{c.owner}</td>
                  <td>{c.response}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
