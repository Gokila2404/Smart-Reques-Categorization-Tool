export default function RequestGuide() {
  const checklist = [
    "Use a clear title with the exact issue (e.g., 'WiFi down in Lab-3').",
    "Describe what happened, where it happened, and when it started.",
    "Add useful evidence like screenshots or error text in description.",
    "Mention urgency only if service is blocked for classes/work.",
    "Avoid duplicate submissions for the same issue."
  ];

  const qualityExamples = [
    {
      bad: "Internet problem",
      good: "Campus WiFi not connecting in Block B since 10:30 AM",
    },
    {
      bad: "Fee issue",
      good: "Semester fee marked unpaid after payment on Feb 10, 2026",
    },
  ];

  return (
    <div className="page">
      <div className="panel panel-body">
        <h2 style={{ marginTop: 0 }}>Request Submission Guide</h2>
        <p className="subtext">
          Follow these guidelines to help admins categorize and resolve requests faster.
        </p>

        <div className="info-banner" style={{ marginTop: 12 }}>
          Average response improves when title, location, and exact time are included.
        </div>

        <div className="info-grid" style={{ marginTop: 12 }}>
          <section className="info-card">
            <h3>Best Practices</h3>
            <ul className="simple-list">
              {checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="info-card">
            <h3>Title Quality Examples</h3>
            {qualityExamples.map((row) => (
              <div key={row.bad} className="example-row">
                <p><strong>Weak:</strong> {row.bad}</p>
                <p><strong>Better:</strong> {row.good}</p>
              </div>
            ))}
          </section>

          <section className="info-card">
            <h3>Before You Submit</h3>
            <ul className="simple-list">
              <li>Check existing requests in your dashboard to avoid duplicates.</li>
              <li>Keep one issue per request for cleaner tracking.</li>
              <li>Use polite, concise language for faster review.</li>
            </ul>
          </section>

          <section className="info-card">
            <h3>Priority Guidance</h3>
            <ul className="simple-list">
              <li>High: Service completely unavailable for class/work.</li>
              <li>Medium: Feature degraded but partial workaround exists.</li>
              <li>Low: General query, document clarification, or minor request.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
