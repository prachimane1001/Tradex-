// Chart.js helper utilities for TradeX stock trends & portfolio charts
window.ChartUtils = {
  renderStockChart(canvasId, historyData, isPositive = true) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart instance if exists
    if (canvas._chartInstance) {
      canvas._chartInstance.destroy();
    }

    if (!historyData || historyData.length === 0) return null;

    const labels = historyData.map(h => {
      const d = new Date(h.timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    const prices = historyData.map(h => h.price);

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    if (isPositive) {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
    }

    const color = isPositive ? '#10b981' : '#ef4444';

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Price ($)',
          data: prices,
          borderColor: color,
          borderWidth: 2,
          fill: true,
          backgroundColor: gradient,
          tension: 0.25,
          pointRadius: 0,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#0f172a',
            titleColor: '#94a3b8',
            bodyColor: '#f8fafc',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            callbacks: {
              label: (context) => ` Price: $${parseFloat(context.parsed.y).toFixed(2)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', maxTicksLimit: 6 }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#64748b' }
          }
        }
      }
    });

    canvas._chartInstance = chart;
    return chart;
  }
};
