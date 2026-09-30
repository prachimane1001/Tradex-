function TransactionsView({ transactions }) {
  const items = transactions || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 }}>
          Virtual Trade Transaction Log
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Historical record of all buy and sell order executions executed on your account.
        </p>
      </div>

      <div className="glass-card table-container">
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <i className="fa-solid fa-receipt" style={{ fontSize: '3rem', color: 'var(--text-dim)', marginBottom: '1rem' }}></i>
            <h3 style={{ fontFamily: 'var(--font-heading)' }}>No Transactions Recorded</h3>
            <p style={{ color: 'var(--text-muted)' }}>Your trade execution history will appear here after you place your first order.</p>
          </div>
        ) : (
          <table className="tradex-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Stock Symbol</th>
                <th>Shares Traded</th>
                <th>Price per Share</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {items.map(t => {
                const isBuy = t.type === 'BUY';
                const date = new Date(t.timestamp).toLocaleString();
                return (
                  <tr key={t._id}>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{date}</td>
                    <td>
                      <span 
                        className={`btn ${isBuy ? 'btn-emerald' : 'btn-ruby'}`} 
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', pointerEvents: 'none' }}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td>
                      <span className="symbol-badge">{t.symbol}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.quantity} shares</td>
                    <td>${t.pricePerShare ? t.pricePerShare.toFixed(2) : '0.00'}</td>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                      ${t.totalAmount ? t.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

window.TransactionsView = TransactionsView;
