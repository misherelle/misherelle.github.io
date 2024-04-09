import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HistoryModal from './components/HistoryModal';
import StockData from './components/StockData';
import AppleStock from './components/AppleStock';
import Weather from './components/Weather';

const stockNames = {
  'AAPL': 'Apple Inc.',
  'GOOG': 'Alphabet Inc.',
  'MSFT': 'Microsoft Corporation',
  'AMZN': 'Amazon.com, Inc.',
  'META': 'Meta Platforms, Inc.',
  'TSLA': 'Tesla, Inc.',
  'BRK.A': 'Berkshire Hathaway Inc.',
  'V': 'Visa Inc.',
  'JPM': 'JPMorgan Chase & Co.',
  'JNJ': 'Johnson & Johnson'
};

function App() {
  
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [stockData, setStockData] = useState({});
  const [historyData, setHistoryData] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetching stock data when selectedStock changes
  useEffect(() => {
    fetchStockData(selectedStock);
    fetchHistoryData();
  }, [selectedStock]);

  // Fetching stock data
  function fetchStockData(stockSymbol) {
    fetch(`http://localhost:3000/stock/${stockSymbol}`)
      .then(response => response.json())
      .then(data => setStockData(data))
      .catch(error => console.error('Error fetching stock data:', error));
  }

  // Saving current stock data
  function saveStockData() {
    fetch('http://localhost:3000/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stockData),
    })
      .then(response => response.json())
      .then(() => {
        alert('Data saved successfully!');
        fetchHistoryData(); // Refreshing history data after saving
      })
      .catch(error => {
        console.error('Error saving stock data:', error);
      });
  }

  // Fetching history data
  function fetchHistoryData() {
    fetch('http://localhost:3000/getHistory')
      .then(response => response.json())
      .then(data => setHistoryData(data))
      .catch(error => console.error('Error fetching history data:', error));
  }

  const openEditModal = () => {
    fetch('http://localhost:3000/getSavedData')
      .then(response => response.json())
      .then(dataArray => {
        setStockData(dataArray);
        setIsEditModalOpen(true);
      })
      .catch(error => {
        console.error('Error fetching saved data:', error);
      });
  };

  // Closing edit modal without saving
  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  // Saving edited data
  const saveEdits = (editedContent) => {
    fetch('http://localhost:3000/edit', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedContent),
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      alert('Data saved successfully!');
      setIsEditModalOpen(false);
    })
    .catch(error => {
      console.error('Error saving edited data:', error);
    });
  };

  // Delete all history data
  function deleteAllHistoryData() {
    fetch('http://localhost:3000/delete', {
      method: 'DELETE',
    })
    .then(response => response.json())
    .then(() => {
      alert('All history data deleted successfully!');
      fetchHistoryData(); // Refreshing history data after deleting
    })
    .catch(error => {
      console.error('Error deleting all history data:', error);
    });
  }

  // Delete last item history data
  function deleteLastHistoryItem() {
    fetch('http://localhost:3000/deleteLast', {
      method: 'DELETE',
    })
    .then(response => response.json())
    .then(() => {
      alert('Last history item deleted successfully!');
      fetchHistoryData(); // Refreshing history data after deleting last item
    })
    .catch(error => {
      console.error('Error deleting last history item:', error);
    });
  }

  return (
    <div className="App">
      <Header />
  
      <div className="outer-container">
        <img src="/succulent.png" alt="Left" className="side-image left"/>
  
        <div className="main-content">
          {/* StockData component rendering */}
          <StockData data={stockData} />
          
          {/* Dropdown for selecting stock */}
          <select onChange={e => setSelectedStock(e.target.value)} value={selectedStock}>
            {Object.entries(stockNames).map(([symbol, name]) => (
              <option key={symbol} value={symbol}>{name} ({symbol})</option>
            ))}
          </select>
          <div></div>
          <button onClick={saveStockData}>Save Most Recent</button>
          <button id="editButton" onClick={openEditModal}>Edit (Add/Delete)</button>
          <button onClick={() => setShowHistoryModal(true)}>History</button>
          <button onClick={deleteAllHistoryData}>Delete All</button>
          <button onClick={deleteLastHistoryItem}>Delete Last Item</button>
  
          {/* Conditionally rendered modals */}
          {isEditModalOpen && (
            <EditModal
              initialStockData={stockData}
              onSave={saveEdits}
              onClose={closeEditModal}
            />
          )}
          {showHistoryModal && (
            <HistoryModal
              data={historyData}
              onClose={() => setShowHistoryModal(false)}
            />
          )}
        </div>
  
        <img src="/flower.png" alt="Right" className="side-image right"/>
      </div>

      
      <AppleStock />
      <Weather />

      <Footer />
    </div>
  );  
}

function EditModal({ initialStockData, onSave, onClose }) {
  const [editedContent, setEditedContent] = useState(JSON.stringify(initialStockData, null, 2));

  const handleSave = () => {
    try {
      const parsedContent = JSON.parse(editedContent);
      onSave(parsedContent);
      window.location.reload(); // Reloading page really quickly to help update edits to history modal
    } catch (error) {
      alert('Invalid JSON format: ' + error.message);
    }
  };

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <h2>Edit Data</h2>
        <textarea
          id="editTextarea"
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          rows="25"
          cols="50"
        ></textarea>
        <div>
          <button
              id="cancelEditButton"
              onClick={onClose}
              style={{ backgroundColor: '#f44336', color: 'white', marginRight: '10px' }}
            >
              Cancel
            </button>
            <button
              id="saveEditButton"
              onClick={handleSave}
              style={{ backgroundColor: '#4CAF50', color: 'white' }}
            >
              Save Edits
            </button>
        </div>
      </div>
    </div>
  );
}

export default App;
