export default function HelpCenter() {
  const faqs = [
    {
      q: "How can I track my complaint?",
      a: "Open Dashboard to see request ID, category, status, and admin remarks.",
    },
    {
      q: "Why is my request in General category?",
      a: "Description may not match category keywords. Add more specific details when submitting.",
    },
    {
      q: "Can admin change status without remarks?",
      a: "Yes, but remarks are recommended for transparency and better communication.",
    },
    {
      q: "How to report urgent issues?",
      a: "Clearly mention impact in title and description, with exact location and time.",
    },
  ];

  return (
    <div className="page">
      <div className="panel panel-body">
        <h2 style={{ marginTop: 0 }}>Help Center</h2>
        <p className="subtext">
          Support information, FAQs, and issue-reporting guidance for users and admins.
        </p>

        <div className="stats-grid" style={{ marginTop: 12 }}>
          <div className="stat-card"><p>Support Window</p><h3>9-5</h3></div>
          <div className="stat-card"><p>Primary Channel</p><h3>Email</h3></div>
          <div className="stat-card"><p>Escalation</p><h3>Urgent Tag</h3></div>
          <div className="stat-card"><p>Tracking</p><h3>Request ID</h3></div>
        </div>

        <div className="info-grid" style={{ marginTop: 12 }}>
          <section className="info-card">
            <h3>Support Channels</h3>
            <ul className="simple-list">
              <li>Email: support@srct.local</li>
              <li>Admin Desk: Mon-Fri, 9:00 AM - 5:00 PM</li>
              <li>Escalation: Add "Urgent" in title only for service-blocking issues</li>
            </ul>
          </section>

          <section className="info-card">
            <h3>Frequently Asked Questions</h3>
            {faqs.map((item) => (
              <div key={item.q} className="faq-item">
                <p><strong>{item.q}</strong></p>
                <p>{item.a}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
