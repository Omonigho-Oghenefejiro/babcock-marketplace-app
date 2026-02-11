import React, { useState } from 'react';
import { Star, User as UserIcon } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Review } from '../types';

interface ReviewsProps {
  productId: string;
}

const Reviews: React.FC<ReviewsProps> = ({ productId }) => {
  const { user, reviews, addReview } = useStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const productReviews = reviews.filter(r => r.productId === productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      addReview(productId, rating, comment);
      setComment('');
      setRating(5);
    }
  };

  return (
    <div className="mt-12 pt-12 border-t border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Review List */}
        <div className="space-y-8">
          {productReviews.length === 0 ? (
            <p className="text-gray-500 italic">No reviews yet. Be the first to review this product!</p>
          ) : (
            productReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <UserIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">{review.userName}</span>
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <div className="flex text-yellow-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed">{review.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Review Form */}
        <div>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>
            {user ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(null)}
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star 
                          className={`h-6 w-6 ${
                            star <= (hoveredStar || rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border"
                    placeholder="Share your thoughts about this product..."
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">Please log in to write a review.</p>
                <a href="/#/login" className="inline-block bg-white border border-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors">
                  Log In
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;