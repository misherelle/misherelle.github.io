import React from 'react';
import './AppleStock.css';
import StockAPIComponent from './StockAPIComponent';
import ImageFlipper from './ImageFlipper';


const AppleStock = () => {
  return (
    <div className="main-content-below">
      <ImageFlipper src="/quack3.png" alt="Left" className="side-left-bottom"/>
      <StockAPIComponent />
      <ImageFlipper src="/quack2.png" alt="Right" className="side-right-bottom"/>
    </div>
  );
};

export default AppleStock;
