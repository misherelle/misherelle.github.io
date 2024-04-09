import React, { useState, useEffect } from 'react';
import './ImageFlipper.css';

const ImageFlipper = ({ src, alt, className }) => {
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    let intervalId;
    if (flip) {
      intervalId = setInterval(() => {
        document.querySelectorAll(`.${className}`).forEach(element => {
          element.classList.toggle('flip');
        });
      }, 90);
    }

    return () => clearInterval(intervalId);
  }, [flip, className]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onMouseEnter={() => setFlip(true)}
      onMouseLeave={() => setFlip(false)}
    />
  );
};

export default ImageFlipper;
