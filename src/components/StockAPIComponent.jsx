import React, { useState } from 'react';

const StockAPIComponent = () => {
  const [index, setIndex] = useState('');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('GET');
  const [lastPrice, setLastPrice] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [updateIndex, setUpdateIndex] = useState('');
  const [updateLastPrice, setUpdateLastPrice] = useState('');
  const [updateDate, setUpdateDate] = useState('');
  const [updateTime, setUpdateTime] = useState('');
  const [deleteIndex, setDeleteIndex] = useState('');

const handleInputChange = (event) => {
  setIndex(event.target.value);
};

// GET request functionality
const handleGetClick = async () => {
  setError('');
  setStockData(null);
  
  const endpoint = index.trim() !== '' ? `/db/${index}` : '/db';
  try {
    const response = await fetch(`http://localhost:3000${endpoint}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);
    setStockData(Array.isArray(data) ? data : [data]);
  } catch (e) {
    setError(e.message);
  }
};

// POST request functionality
const handlePostClick = async () => {
  // Constructing new stock object with user input
  const newStockData = {
    lastPrice: parseFloat(lastPrice), // Converting lastPrice to number
    date: date,
    time: time,
  };

  // POST request with new stock data
  try {
    const response = await fetch('http://localhost:3000/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStockData),
    });

    if (!response.ok) throw new Error(`HTTP status ${response.status}`);
    const addedStock = await response.json();

    // Handling added stock as needed
    console.log('Newly added stock:', addedStock);
    setStockData([addedStock]); // Displaying only newly added stock

    alert('Stock has been successfully added.');

  } catch (error) {
    console.error('Error during POST request:', error);
    setError(error.toString());
  }
};  

// PUT request functionality
const handlePutClick = async () => {
  const updatedStockData = {
    lastPrice: updateLastPrice ? parseFloat(updateLastPrice) : undefined,
    date: updateDate,
    time: updateTime,
  };

  const endpoint = updateIndex ? `/db/${updateIndex}` : '/db';

  try {
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedStockData),
    });

    // Checking ig response's content type is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const updatedStock = await response.json();
      console.log('Updated stock:', updatedStock);
      // Updating state as needed or alerting user
      alert('Stock has been successfully updated.');
      if (updateIndex) {
        setStockData([updatedStock]);
      } else {
        const updatedListResponse = await fetch('http://localhost:3000/db');
        if (!updatedListResponse.ok) throw new Error(`HTTP status ${updatedListResponse.status}`);
        const updatedList = await updatedListResponse.json();
        setStockData(updatedList);
      }
    } else {
      console.log('Response:', await response.text());
      alert('Bulk update confirmation received.');
      // Fetching latest stock list to update UI
      const updatedListResponse = await fetch('http://localhost:3000/db');
      if (!updatedListResponse.ok) throw new Error(`HTTP status ${updatedListResponse.status}`);
      const updatedList = await updatedListResponse.json();
      setStockData(updatedList);
    }
  } catch (error) {
    console.error('Error during PUT request:', error);
    setError('An error occurred, please try again.');
  }
};

// DELETE request functionality
const handleDeleteClick = async () => {
  const endpoint = deleteIndex.trim() !== '' ? `/db/${deleteIndex}` : '/db';
  try {
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`HTTP status ${response.status}`);
    alert(await response.text());
    setDeleteIndex(''); // Clearing input field
  } catch (e) {
    setError(e.message);
  }
};

return (
  <div>
    <p id="stockAPI"><strong>Apple Inc. (AAPL) Stock Overview</strong></p>
    <div>
      <button onClick={() => setActiveTab('GET')}>GET</button>
      <button onClick={() => setActiveTab('POST')}>POST</button>
      <button onClick={() => setActiveTab('PUT')}>PUT</button>
      <button onClick={() => setActiveTab('DELETE')}>DELETE</button>
    </div>
    
    {activeTab === 'GET' && (
      <>
        <input
          type="text"
          value={index}
          onChange={handleInputChange}
          placeholder="Index (blank = ALL)"
        />
        <button onClick={handleGetClick}>GET</button>
      </>
    )}

    {activeTab === 'POST' && (
      <>
        <input
          type="number"
          value={lastPrice}
          onChange={(e) => setLastPrice(e.target.value)}
          placeholder="Last Price"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <button onClick={handlePostClick}>Submit</button>
      </>
    )}

    {activeTab === 'PUT' && (
      <>
        <input
          type="text"
          value={updateIndex}
          onChange={(e) => setUpdateIndex(e.target.value)}
          placeholder="Index (blank = ALL)"
        />
        <input
          type="number"
          value={updateLastPrice}
          onChange={(e) => setUpdateLastPrice(e.target.value)}
          placeholder="New Last Price"
        />
        <input
          type="date"
          value={updateDate}
          onChange={(e) => setUpdateDate(e.target.value)}
        />
        <input
          type="time"
          value={updateTime}
          onChange={(e) => setUpdateTime(e.target.value)}
        />
        <button onClick={handlePutClick}>Update</button>
      </>
    )}

    {activeTab === 'DELETE' && (
      <>
         <input
          type="text"
          value={deleteIndex}
          onChange={(e) => setDeleteIndex(e.target.value)}
          placeholder="Index (blank = ALL)"
        />
        <button onClick={handleDeleteClick}>Delete</button>
      </>
    )}

    {/* Error Display */}
    {error && <div>Error: {error}</div>}

    {/* Data Display */}
    {stockData && (
      <div>
        {stockData.map((stock, idx) => (
          <div key={idx}>
            <div>Index: {stock.index}</div>
            <div>Symbol: {stock.symbol}</div>
            <div>Name: {stock.name}</div>
            <div>Sector: {stock.sector}</div>
            <div>Last Price: {stock.lastPrice}</div>
            <div>Market Cap: {stock.marketCap}</div>
            <div>Date: {stock.date}</div>
            <div>Time: {stock.time}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);
};

export default StockAPIComponent;