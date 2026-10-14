// components/card.jsx
import React from 'react';
import './card.css';

const Card = ({ image, title, status }) => {
  return (
    <li>
      <a href="#" className="card">
        <img src={image} className="card__image" alt={title} />
        <div className="card__overlay">
          <div className="card__header">
            <svg className="card__arc" xmlns="http://www.w3.org/2000/svg">
              <path />
            </svg>
            <img className="card__thumb" src="public\img\logo.jpg" alt={title} />
            <div className="card__header-text">
              <h3 className="card__title">{title}</h3>
              <span className="card__status">{status}</span>
            </div>
          </div>
        </div>
      </a>
    </li>
  );
};

export default Card;
