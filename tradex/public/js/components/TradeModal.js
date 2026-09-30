function TradeModal({ stock, initialType = 'BUY', user, portfolio, onClose, onExecuteTrade, showToast }) {
  const [tradeType, setTradeType] = React.useState(initialType);
  const [quantity, setQuantity] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  if (!stock) return null;

  const currentPrice = stock.currentPrice || 0;
  const numQuantity = parseInt(quantity, 10) || 0;
  const estimatedTotal = parseFloat((currentPrice * numQuantity).toFixed(2));

  const availableBalance = user ? user.virtualBalance : 0;
  const holding = (portfolio || []).find(h => h.symbol === stock.symbol);
  const ownedShares = holding ? holding.quantity : 0;

  const isBuy = tradeType === 'BUY';
  const canAfford = isBuy ? availableBalance >= estimatedTotal : ownedShares >= numQuantity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (numQuantity <= 0) {
      showToast('Please enter a valid positive number of shares.', 'error');
      return;
    }

    if (!canAfford) {
      showToast(isBuy ? 'Insufficient virtual cash balance.' : `You only own ${ownedShares} shares.`, 'error');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isBuy ? '/trade/buy' : '/trade/sell';
      const res = await window.API.post(endpoint, {
        symbol: stock.symbol,
        quantity: numQuantity
      });

      if (res.success) {
        showToast(res.message, 'success');
        onExecuteTrade();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Trade execution failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="symbol-badge">{stock.symbol}</span>
            <h2 className="modal-title">{stock.name}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Trade Type Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button 
            type="button"
            className={`btn ${isBuy ? 'btn-emerald' : 'btn-outline'}`}
            onClick={() => setTradeType('BUY')}
          >
            BUY STOCK
          </button>
          <button 
            type="button"
            className={`btn ${!isBuy ? 'btn-ruby' : 'btn-outline'}`}
            onClick={() => setTradeType('SELL')}
          >
            SELL STOCK
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Market Price Display */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Live Market Execution Price</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem' }}>
              ${currentPrice.toFixed(2)}
            </span>
          </div>

          {/* Quantity Input */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
              Number of Shares to {tradeType}
            </label>
            <input 
              type="number"
              min="1"
              max={isBuy ? 100000 : ownedShares}
              className="input-glass"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              required
            />
          </div>

          {/* Buying Power / Holdings Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>{isBuy ? 'Available Cash Balance:' : 'Shares Currently Owned:'}</span>
            <strong style={{ color: '#fff' }}>
              {isBuy ? `$${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${ownedShares} shares`}
            </strong>
          </div>

          {/* Total Cost Breakdown */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Estimated Order Total:</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: isBuy ? 'var(--emerald)' : 'var(--ruby)' }}>
              ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn ${isBuy ? 'btn-emerald' : 'btn-ruby'}`} 
              style={{ flex: 1 }}
              disabled={loading || !canAfford || numQuantity <= 0}
            >
              {loading ? 'Processing Order...' : `Confirm ${tradeType} Order`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

window.TradeModal = TradeModal;
