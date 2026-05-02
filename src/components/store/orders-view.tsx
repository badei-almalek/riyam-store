'use client';

import { ShoppingBag, Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/store/use-store';
import { ORDERS } from '@/lib/text';
import type { Order } from '@/types';

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  pending: { label: ORDERS.status.pending, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
  confirmed: { label: ORDERS.status.confirmed, icon: CheckCircle, color: 'text-sage', bgColor: 'bg-sage/10' },
  shipped: { label: ORDERS.status.shipped, icon: Truck, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
  delivered: { label: ORDERS.status.delivered, icon: Package, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
  cancelled: { label: ORDERS.status.cancelled, icon: XCircle, color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20' },
};

export function OrdersView() {
  const { orderHistory, setView, formatPrice } = useStore();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ar-YE', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getOrderTotal = (order: Order) => {
    return formatPrice(order.totalYER);
  };

  if (orderHistory.length === 0) {
    return (
      <div className="animate-fade-in container mx-auto px-4 sm:px-8 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-sm mx-auto space-y-5"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-secondary border border-sage/10 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-sage/40" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{ORDERS.emptyTitle}</h2>
          <p className="text-muted-foreground text-sm font-light">{ORDERS.emptyDesc}</p>
          <Button onClick={() => setView('home')} className="rounded-none px-8 bg-terracotta text-white hover:bg-terracotta-dark font-bold shine-btn">
            {ORDERS.browseProducts}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in container mx-auto px-4 sm:px-8 py-8 space-y-8">
      <div>
        <span className="text-sage/50 text-sm font-medium tracking-widest uppercase">{ORDERS.sectionLabel}</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{ORDERS.title}</h1>
        <p className="text-muted-foreground text-sm mt-1 font-light">{orderHistory.length} {ORDERS.itemCount}</p>
      </div>

      <div className="space-y-4">
        {orderHistory.map((order, index) => {
          const status = statusConfig[order.status] || statusConfig.pending;
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="rounded-lg border border-sage/8 bg-card p-5 space-y-4 hover:border-sage/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${status.bgColor}`}>
                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{ORDERS.orderNumber} #{order.id.slice(-6)}</p>
                    <p className="text-xs text-muted-foreground font-light">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`${status.color} border-current text-xs rounded-none`}>{status.label}</Badge>
              </div>

              <div className="sage-line-wide" />

              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-foreground line-clamp-1 font-light">{item.productName}</span>
                    <span className="text-muted-foreground shrink-0">×{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="sage-line-wide" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-light">{order.items.length} {ORDERS.productCount} • {order.items.reduce((sum, item) => sum + item.quantity, 0)} {ORDERS.piecesCount} • {order.customerName}</span>
                <span className="font-bold text-sage">{getOrderTotal(order)}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
