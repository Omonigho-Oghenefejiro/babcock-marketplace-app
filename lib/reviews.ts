import { Order } from '../types';

export const hasUserPurchasedProduct = (
  orders: Order[] | undefined,
  productId: string,
): boolean => {
  if (!Array.isArray(orders) || !productId) {
    return false;
  }

  return orders.some((order) => {
    if (order?.paymentStatus !== 'completed' || order?.status === 'cancelled') {
      return false;
    }

    return Array.isArray(order.items) && order.items.some((item) => String(item?.id) === String(productId));
  });
};
