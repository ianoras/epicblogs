import React from 'react';

const StarRating = ({ rating, onRatingChange, readOnly = false }) => {
    return (
        <div className="d-flex align-items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <i
                    key={star}
                    className={`bi bi-star${star <= rating ? '-fill' : ''} me-1`}
                    style={{
                        cursor: readOnly ? 'default' : 'pointer',
                        color: star <= rating ? '#ffc107' : '#e4e5e9',
                        fontSize: '1.5rem'
                    }}
                    onClick={() => !readOnly && onRatingChange(star)}
                />
            ))}
        </div>
    );
};

export default StarRating; 