import React from 'react';

function StockData({ data }) {
    return (
        <div id="stockData" className="container">
            <p id="price"><strong>Last Price:</strong> {data.last}</p>
            {data.mid && <p><strong>Mid Price:</strong> {data.mid}</p>}
            {data.ask && <p><strong>Ask Price:</strong> {data.ask}</p>}
        </div>
    );
}

export default StockData;