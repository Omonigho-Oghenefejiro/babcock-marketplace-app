import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, PackageCheck, Star } from 'lucide-react';
import API from '../services/api';
import { useStore } from '../contexts/StoreContext';
import { useToast } from '../contexts/ToastContext';

type PurchasedItem = {
  orderId: string;
  purchasedAt: string;
  orderStatus: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  isLive: boolean;
  hasRated: boolean;
  myRating?: {
    rating: number;
    review: string;
    createdAt?: string;
  } | null;
};

const PurchasedItems = () => {
  const navigate = useNavigate();
  const { user, addReview } = useStore();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PurchasedItem[]>([]);
  const [submittingId, setSubmittingId] = useState<string>('');
  const [forms, setForms] = useState<Record<string, { rating: number; comment: string }>>({});

  const loadPurchasedItems = async () => {
    try {
      const { data } = await API.get('/orders/purchased-items');
      const incoming = Array.isArray(data) ? data : [];
      setItems(incoming);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to load purchased items';
      addToast(msg, 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/purchased-items' } });
      return;
    }
    loadPurchasedItems();
  }, [user]);

  const groupedByOrder = useMemo(() => {
    return items.reduce<Record<string, PurchasedItem[]>>((acc, item) => {
      if (!acc[item.orderId]) {
        acc[item.orderId] = [];
      }
      acc[item.orderId].push(item);
      return acc;
    }, {});
  }, [items]);

  const handleSubmitRating = async (item: PurchasedItem) => {
    const key = `${item.orderId}-${item.productId}`;
    const form = forms[key] || { rating: 5, comment: '' };

    if (!form.comment.trim()) {
      addToast('Please enter a short review before submitting', 'error');
      return;
    }

    try {
      setSubmittingId(key);
      await addReview(item.productId, form.rating, form.comment.trim());
      await loadPurchasedItems();
      setForms((prev) => ({
        ...prev,
        [key]: { rating: 5, comment: '' },
      }));
      addToast('Thanks! Your rating has been submitted.');
    } catch {
      // toast handled by context
    } finally {
      setSubmittingId('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-[#1B4332] font-semibold">
        Loading purchased items...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-4 py-10 md:px-8">
      <div className="max-w-5xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#2D6A4F] mb-4 hover:opacity-80">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#D8F3DC] flex items-center justify-center">
            <PackageCheck className="text-[#1B4332]" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B4332]">Purchased Items</h1>
            <p className="text-sm text-[#6B7280]">Rate what you bought. Ratings show on live product pages.</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-10 text-center">
            <p className="text-[#1A1A1A] font-semibold mb-2">No completed purchases yet</p>
            <p className="text-sm text-[#6B7280] mb-5">Complete a payment to see purchased items here.</p>
            <Link to="/shop" className="inline-block bg-[#1B4332] text-white rounded-xl px-6 py-3 font-semibold">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(groupedByOrder).map(([orderId, orderItems]) => (
              <div key={orderId} className="bg-white border border-[#E8E2D9] rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <p className="text-sm text-[#6B7280]">
                    Order <span className="font-semibold text-[#1A1A1A]">#{orderId.slice(-8).toUpperCase()}</span>
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {new Date(orderItems[0].purchasedAt).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-4">
                  {orderItems.map((item) => {
                    const key = `${item.orderId}-${item.productId}`;
                    const form = forms[key] || { rating: 5, comment: '' };
                    const canRate = item.isLive;

                    return (
                      <div key={key} className="border border-[#E8E2D9] rounded-xl p-4">
                        <div className="flex flex-wrap md:flex-nowrap gap-4">
                          <img
                            src={item.image || 'https://placehold.co/180x180/E8E2D9/1A1A1A?text=Item'}
                            alt={item.title}
                            className="w-20 h-20 object-cover rounded-lg border border-[#E8E2D9]"
                          />

                          <div className="flex-1 min-w-[220px]">
                            <p className="font-semibold text-[#1A1A1A]">{item.title}</p>
                            <p className="text-sm text-[#6B7280] mt-1">
                              Qty: {item.quantity} · ₦{Number(item.price || 0).toLocaleString()}
                            </p>

                            <div className="mt-2">
                              {item.isLive ? (
                                <Link to={`/product/${item.productId}`} className="text-sm text-[#2D6A4F] font-semibold hover:opacity-80">
                                  View live product page
                                </Link>
                              ) : (
                                <span className="text-sm text-[#6B7280]">Product is no longer live</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-[#F1ECE3]">
                          {item.hasRated && item.myRating ? (
                            <div className="bg-[#F0FAF2] border border-[#D8F3DC] rounded-lg p-3">
                              <p className="text-sm font-semibold text-[#1B4332] mb-1">
                                Your rating: {item.myRating.rating}/5
                              </p>
                              <p className="text-sm text-[#2D6A4F]">{item.myRating.review}</p>
                            </div>
                          ) : canRate ? (
                            <div className="space-y-3">
                              <p className="text-sm font-semibold text-[#1A1A1A]">Leave a rating</p>

                              <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((value) => (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => setForms((prev) => ({ ...prev, [key]: { ...form, rating: value } }))}
                                    className="p-1"
                                  >
                                    <Star
                                      size={18}
                                      color={value <= form.rating ? '#F4A226' : '#D1D5DB'}
                                      fill={value <= form.rating ? '#F4A226' : 'none'}
                                    />
                                  </button>
                                ))}
                              </div>

                              <textarea
                                value={form.comment}
                                onChange={(e) => setForms((prev) => ({ ...prev, [key]: { ...form, comment: e.target.value } }))}
                                placeholder="Share your experience with this item"
                                className="w-full border border-[#E8E2D9] rounded-lg p-3 text-sm outline-none focus:border-[#2D6A4F]"
                                rows={3}
                              />

                              <button
                                type="button"
                                onClick={() => handleSubmitRating(item)}
                                disabled={submittingId === key}
                                className="bg-[#1B4332] text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
                              >
                                {submittingId === key ? 'Submitting...' : 'Submit Rating'}
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-[#6B7280]">This product is no longer live, so rating is disabled.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchasedItems;
