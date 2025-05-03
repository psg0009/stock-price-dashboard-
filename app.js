const {
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  RotateCw,
  AlertCircle,
  ArrowUp,
  ArrowDown
} = lucide;

// Configuration
const STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'WMT'];
const API_KEY = 'F2BQNCPSPO0EMJ2C'; // Using Alpha Vantage's  key 

// Main StockDashboard component
function StockDashboard() {
  const [stocks, setStocks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState({ key: 'symbol', direction: 'ascending' });

  React.useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      setError(null);
      
      try {
       
        const stockData = await Promise.all(
          STOCKS.map(async (symbol) => {
            try {
             
              const response = await fetch(
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
              );
              
              if (!response.ok) throw new Error('Network response was not ok');
              
              const data = await response.json();
              
              // Check if we got valid data or hit API limits
              if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
                const quote = data['Global Quote'];
                return {
                  symbol,
                  price: parseFloat(quote['05. price']),
                  change: parseFloat(quote['09. change']),
                  changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                  volume: parseInt(quote['06. volume']),
                  lastUpdated: new Date().toLocaleTimeString()
                };
              } else {
                
                return generateMockData(symbol);
              }
            } catch (err) {
              console.error(`Error fetching ${symbol}:`, err);
              return generateMockData(symbol);
            }
          })
        );
        
        setStocks(stockData);
      } catch (err) {
        setError('Failed to fetch stock data. Please try again later.');
        console.error('Error fetching stock data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStockData();
    
   
    const interval = setInterval(fetchStockData, 60000);
    return () => clearInterval(interval);
  }, []);
  
  
  const generateMockData = (symbol) => {
    const basePrice = {
      'AAPL': 190.25, 'MSFT': 420.75, 'GOOGL': 171.90, 'AMZN': 185.80, 
      'META': 495.60, 'TSLA': 193.75, 'NVDA': 890.25, 'JPM': 198.40, 
      'V': 275.30, 'WMT': 62.50
    }[symbol] || 100;
    
    const changePercent = (Math.random() * 6 - 3).toFixed(2); 
    const change = (basePrice * changePercent / 100).toFixed(2);
    
    return {
      symbol,
      price: basePrice,
      change: parseFloat(change),
      changePercent: parseFloat(changePercent),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      lastUpdated: new Date().toLocaleTimeString(),
      isMockData: true // Flag to indicate this is mock data
    };
  };
  
  // Search functionality
  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sorting functionality
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
  
  // Refresh data manually
  const handleRefresh = () => {
    setLoading(true);
    // Re-trigger the useEffect by forcing a re-render
    setStocks([]);
  };
  
  // Create Lucide icon elements with React
  const createIcon = (icon, props = {}) => {
    const IconComponent = icon;
    return React.createElement(IconComponent, props);
  };

  return React.createElement(
    'div',
    { className: "min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100" },
    React.createElement(
      'div',
      { className: "container mx-auto px-4 py-8" },
      // Header
      React.createElement(
        'header',
        { className: "mb-8" },
        React.createElement('h1', { className: "text-3xl font-bold text-center mb-2" }, "Stock Market Dashboard"),
        React.createElement('p', { className: "text-center text-gray-400" }, "Live (or simulated) stock market data")
      ),
      
      // Search and Controls
      React.createElement(
        'div',
        { className: "flex flex-col md:flex-row justify-between items-center mb-6 gap-4" },
        React.createElement(
          'div',
          { className: "relative w-full md:w-64" },
          React.createElement(
            'div',
            { className: "absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" },
            createIcon(Search, { className: "h-5 w-5 text-gray-400" })
          ),
          React.createElement(
            'input',
            {
              type: "text",
              className: "bg-slate-800 border border-slate-700 text-white rounded-lg block w-full pl-10 p-2.5 focus:ring-blue-500 focus:border-blue-500",
              placeholder: "Search stocks...",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value)
            }
          )
        ),
        React.createElement(
          'div',
          { className: "flex space-x-2" },
          React.createElement(
            'button',
            {
              onClick: handleRefresh,
              disabled: loading,
              className: "flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            },
            createIcon(RotateCw, { className: `h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}` }),
            "Refresh"
          ),
          React.createElement(
            'div',
            { className: "text-sm text-gray-400 flex items-center" },
            "Last updated: ",
            stocks.length > 0 ? stocks[0].lastUpdated : 'N/A'
          )
        )
      ),
      
      // Main Content
      loading ? React.createElement(
        'div',
        { className: "flex flex-col items-center justify-center h-64" },
        createIcon(RotateCw, { className: "h-12 w-12 text-blue-500 animate-spin mb-4" }),
        React.createElement('p', { className: "text-lg" }, "Loading stock data...")
      ) : error ? React.createElement(
        'div',
        { className: "bg-red-900/20 border border-red-800 p-6 rounded-lg flex items-center justify-center" },
        createIcon(AlertCircle, { className: "h-8 w-8 text-red-500 mr-3" }),
        React.createElement('p', { className: "text-lg text-red-400" }, error)
      ) : React.createElement(
        React.Fragment,
        null,
        
        // Stock Table
        React.createElement(
          'div',
          { className: "overflow-x-auto rounded-lg border border-slate-700 mb-8" },
          React.createElement(
            'table',
            { className: "min-w-full divide-y divide-slate-700" },
            React.createElement(
              'thead',
              { className: "bg-slate-800" },
              React.createElement(
                'tr',
                null,
                ['symbol', 'price', 'changePercent', 'volume'].map(key => {
                  const labels = {
                    symbol: 'Symbol',
                    price: 'Price',
                    changePercent: 'Change',
                    volume: 'Volume'
                  };
                  
                  return React.createElement(
                    'th',
                    {
                      key: key,
                      scope: "col",
                      className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer",
                      onClick: () => handleSort(key)
                    },
                    React.createElement(
                      'div',
                      { className: "flex items-center" },
                      labels[key],
                      sortConfig.key === key && createIcon(
                        sortConfig.direction === 'ascending' ? ArrowUp : ArrowDown,
                        { className: "h-3 w-3 ml-1" }
                      )
                    )
                  );
                })
              )
            ),
            React.createElement(
              'tbody',
              { className: "bg-slate-900 divide-y divide-slate-800" },
              sortedStocks.length > 0 ? sortedStocks.map(stock =>
                React.createElement(
                  'tr',
                  { key: stock.symbol, className: "hover:bg-slate-800" },
                  React.createElement(
                    'td',
                    { className: "px-6 py-4 whitespace-nowrap" },
                    React.createElement(
                      'div',
                      { className: "flex items-center" },
                      React.createElement(
                        'div',
                        { className: "text-sm font-medium" },
                        stock.symbol,
                        stock.isMockData && React.createElement(
                          'span',
                          { className: "text-xs text-gray-500 ml-2" },
                          "(demo)"
                        )
                      )
                    )
                  ),
                  React.createElement(
                    'td',
                    { className: "px-6 py-4 whitespace-nowrap text-sm" },
                    `$${stock.price.toFixed(2)}`
                  ),
                  React.createElement(
                    'td',
                    { className: "px-6 py-4 whitespace-nowrap" },
                    React.createElement(
                      'div',
                      { className: `flex items-center text-sm ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}` },
                      createIcon(stock.changePercent >= 0 ? ArrowUpCircle : ArrowDownCircle, { className: "h-4 w-4 mr-1" }),
                      React.createElement('span', null, stock.change.toFixed(2)),
                      React.createElement('span', { className: "ml-1" }, `(${stock.changePercent.toFixed(2)}%)`)
                    )
                  ),
                  React.createElement(
                    'td',
                    { className: "px-6 py-4 whitespace-nowrap text-sm" },
                    new Intl.NumberFormat().format(stock.volume)
                  )
                )
              ) : React.createElement(
                'tr',
                null,
                React.createElement(
                  'td',
                  { colSpan: "4", className: "px-6 py-4 text-center text-sm text-gray-500" },
                  "No matching stocks found"
                )
              )
            )
          )
        ),
        
        // Stock Performance Chart 
        React.createElement(
          'div',
          { className: "bg-slate-800 p-6 rounded-lg border border-slate-700" },
          React.createElement('h2', { className: "text-xl font-semibold mb-4" }, "Stock Performance Overview"),
          React.createElement(
            'div',
            { className: "h-64 flex items-end justify-between px-2" },
            sortedStocks.slice(0, 10).map(stock =>
              React.createElement(
                'div',
                { key: `chart-${stock.symbol}`, className: "flex flex-col items-center w-full max-w-16" },
                React.createElement(
                  'div',
                  {
                    className: `w-12 rounded-t-md ${stock.changePercent >= 0 ? 'bg-green-500' : 'bg-red-500'}`,
                    style: {
                      height: `${Math.abs(stock.changePercent) * 6 + 20}px`,
                      minHeight: '20px'
                    }
                  }
                ),
                React.createElement('div', { className: "mt-2 text-xs font-medium truncate w-full text-center" }, stock.symbol)
              )
            )
          ),
          React.createElement(
            'div',
            { className: "text-xs text-gray-400 text-center mt-4" },
            "Chart shows relative percentage change (not to scale)"
          )
        ),
        
        // Summary Stats
        React.createElement(
          'div',
          { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8" },
          // Top Gainer
          React.createElement(
            'div',
            { className: "bg-slate-800 p-4 rounded-lg border border-slate-700" },
            React.createElement('h3', { className: "text-sm font-medium text-gray-400" }, "Top Gainer"),
            stocks.length > 0 && React.createElement(
              'div',
              { className: "mt-2" },
              (() => {
                const topGainer = [...stocks].sort((a, b) => b.changePercent - a.changePercent)[0];
                return React.createElement(
                  React.Fragment,
                  null,
                  React.createElement('div', { className: "text-lg font-semibold" }, topGainer.symbol),
                  React.createElement(
                    'div',
                    { className: "text-green-500 flex items-center" },
                    createIcon(ArrowUpCircle, { className: "h-4 w-4 mr-1" }),
                    `${topGainer.changePercent.toFixed(2)}%`
                  )
                );
              })()
            )
          ),
          
          // Top Loser
          React.createElement(
            'div',
            { className: "bg-slate-800 p-4 rounded-lg border border-slate-700" },
            React.createElement('h3', { className: "text-sm font-medium text-gray-400" }, "Top Loser"),
            stocks.length > 0 && React.createElement(
              'div',
              { className: "mt-2" },
              (() => {
                const topLoser = [...stocks].sort((a, b) => a.changePercent - b.changePercent)[0];
                return React.createElement(
                  React.Fragment,
                  null,
                  React.createElement('div', { className: "text-lg font-semibold" }, topLoser.symbol),
                  React.createElement(
                    'div',
                    { className: "text-red-500 flex items-center" },
                    createIcon(ArrowDownCircle, { className: "h-4 w-4 mr-1" }),
                    `${topLoser.changePercent.toFixed(2)}%`
                  )
                );
              })()
            )
          ),
          
          // Market Overview
          React.createElement(
            'div',
            { className: "bg-slate-800 p-4 rounded-lg border border-slate-700" },
            React.createElement('h3', { className: "text-sm font-medium text-gray-400" }, "Market Overview"),
            stocks.length > 0 && React.createElement(
              'div',
              { className: "mt-2" },
              React.createElement(
                'div',
                { className: "text-lg font-semibold" },
                `${stocks.filter(s => s.changePercent >= 0).length} / ${stocks.length}`
              ),
              React.createElement(
                'div',
                { className: "text-gray-400" },
                "stocks trading positively"
              )
            )
          ),
          
          // Average Change
          React.createElement(
            'div',
            { className: "bg-slate-800 p-4 rounded-lg border border-slate-700" },
            React.createElement('h3', { className: "text-sm font-medium text-gray-400" }, "Avg. Change"),
            stocks.length > 0 && React.createElement(
              'div',
              { className: "mt-2" },
              (() => {
                const avgChange = stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / stocks.length;
                return React.createElement(
                  React.Fragment,
                  null,
                  React.createElement(
                    'div',
                    { className: `text-lg font-semibold flex items-center ${avgChange >= 0 ? 'text-green-500' : 'text-red-500'}` },
                    createIcon(avgChange >= 0 ? ArrowUpCircle : ArrowDownCircle, { className: "h-5 w-5 mr-1" }),
                    `${avgChange.toFixed(2)}%`
                  ),
                  React.createElement(
                    'div',
                    { className: "text-gray-400" },
                    "average change today"
                  )
                );
              })()
            )
          )
        )
      ),
      
      // Footer
      React.createElement(
        'footer',
        { className: "mt-12 text-center text-sm text-gray-500" },
        React.createElement('p', null, "Stock Dashboard - Created with React and Tailwind CSS"),
        React.createElement('p', { className: "mt-1" }, "Data provided by Alpha Vantage API")
      )
    )
  );
}


const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(React.createElement(StockDashboard));
