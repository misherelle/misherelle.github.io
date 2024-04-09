import React, { useRef } from 'react';

function HistoryModal({ data, onClose }) {
  const bottomRef = useRef(null); // Creating ref for bottom

  const scrollToBottom = () => {
    bottomRef.current.scrollIntoView({ behavior: "smooth" }); // Scrolling to bottom element smoothly
  };

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <button onClick={onClose} style={{ position: 'absolute', right: '0px' }}>&times;</button>
        <h2>History</h2>
        <button onClick={scrollToBottom} style={{ margin: '10px' }}>Go to bottom</button>
        <div className="history-content">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
        {/* div positioned at bottom to be scrolled into view */}
        <div ref={bottomRef}></div> 
      </div>
    </div>
  );
}

export default HistoryModal;