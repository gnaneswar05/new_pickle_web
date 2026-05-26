'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Download, ShoppingBag, Calendar, Truck, ChevronRight, Search, X, Package, CheckCircle2, Lock, ReceiptText, MapPin, Phone, Mail, User } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showShipModal, setShowShipModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [courierInfo, setCourierInfo] = useState({ name: '', trackingId: '' });

  const fetchOrders = () => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Orders Error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: string, courier?: any) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status, 
        courierName: courier?.name, 
        courierTrackingId: courier?.trackingId 
      })
    });
    if (res.ok) {
      toast.success(`Order marked as ${status}`);
      setShowShipModal(false);
      setShowDetailsModal(false);
      setCourierInfo({ name: '', trackingId: '' });
      fetchOrders();
    }
  };

  const handleStatusChange = (order: any, newStatus: string) => {
    if (order.status === 'Delivered') {
      toast.error('Delivered orders are finalized.');
      return;
    }
    if (newStatus === 'Shipped') {
      setSelectedOrder(order);
      setShowShipModal(true);
    } else {
      updateStatus(order._id, newStatus);
    }
  };

  const openDetails = (order: any) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return { bg: 'var(--secondary)', text: 'var(--primary)', dot: 'var(--primary)' };
      case 'Processing': return { bg: '#eff6ff', text: '#2563eb', dot: '#3b82f6' };
      case 'Shipped': return { bg: '#fef3c7', text: '#d97706', dot: '#f59e0b' };
      case 'Cancelled': return { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' };
      default: return { bg: 'var(--background)', text: 'var(--text-muted)', dot: 'var(--border)' };
    }
  };

  const filteredOrders = orders.filter((o: any) => 
    o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o._id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px 0', fontFamily: 'Fraunces, serif' }}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', marginBottom: '60px' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--text-main)', margin: 0, fontFamily: 'Fraunces, serif' }}>
            Order <span style={{ color: 'var(--primary)' }}>Vault</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontWeight: '500' }}>Manage shipments and customer fulfillment.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search orders..." 
              style={{ padding: '14px 14px 14px 45px', borderRadius: '18px', border: '1px solid var(--border)', background: 'var(--surface)', width: '250px', outline: 'none', fontWeight: '600', color: 'var(--text-main)' }}
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div style={{ background: 'var(--surface)', borderRadius: '40px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '25px 30px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Order</th>
              <th style={{ padding: '25px 30px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Customer</th>
              <th style={{ padding: '25px 30px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Billing</th>
              <th style={{ padding: '25px 30px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '25px 30px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o: any) => {
              const status = getStatusColor(o.status);
              const isLocked = o.status === 'Delivered';
              
              return (
                <tr key={o._id} style={{ borderBottom: '1px solid var(--border)', background: isLocked ? 'var(--background)' : 'var(--surface)' }}>
                  <td style={{ padding: '25px 30px' }}>
                    <div style={{ fontWeight: '800', color: isLocked ? 'var(--text-muted)' : 'var(--text-main)' }}>#{o._id.slice(-6).toUpperCase()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: '25px 30px' }}>
                    <div style={{ fontWeight: '700', color: isLocked ? 'var(--text-muted)' : 'var(--text-main)' }}>{o.customerName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.phone}</div>
                  </td>
                  <td style={{ padding: '25px 30px' }}>
                    <div style={{ fontWeight: '900', color: isLocked ? 'var(--text-muted)' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      ₹{(o.totalAmount || 0).toFixed(2)}
                      {(o.deliveryCharge || 0) > 0 && (
                        <span style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '6px' }}>
                          +₹{o.deliveryCharge}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{o.paymentMethod}</div>
                  </td>
                  <td style={{ padding: '25px 30px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', background: status.bg, color: status.text, fontWeight: '800', fontSize: '0.75rem' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: status.dot }}></div>
                      <select 
                        value={o.status}
                        onChange={(e) => handleStatusChange(o, e.target.value)}
                        style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 'inherit', fontSize: 'inherit', outline: 'none', cursor: 'pointer', appearance: 'none' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                  <td style={{ padding: '25px 30px', textAlign: 'right' }}>
                    <button 
                      onClick={() => openDetails(o)}
                      style={{ background: 'var(--background)', border: '1px solid var(--border)', padding: '10px 18px', borderRadius: '12px', color: 'var(--text-main)', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      View Details <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ORDER DETAILS MODAL */}
      {showDetailsModal && selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(10px)' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '50px', borderRadius: '48px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.25)' }}>
            <button onClick={() => setShowDetailsModal(false)} style={{ position: 'absolute', right: '40px', top: '40px', background: 'var(--background)', border: 'none', padding: '12px', borderRadius: '16px', cursor: 'pointer', color: 'var(--text-main)' }}><X size={24} /></button>
            
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-main)', fontFamily: 'Fraunces, serif', margin: 0 }}>Order Details</h2>
              <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>ID: #{selectedOrder?._id?.toUpperCase()}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
              {/* Customer Info */}
              <div style={{ background: 'var(--background)', padding: '30px', borderRadius: '32px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><User size={18} color="currentColor" style={{ color: 'var(--primary)' }} /> Customer</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>{selectedOrder?.customerName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <Phone size={14} /> {selectedOrder?.phone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <Mail size={14} /> {selectedOrder?.email}
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div style={{ background: 'var(--background)', padding: '30px', borderRadius: '32px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin size={18} color="currentColor" style={{ color: 'var(--primary)' }} /> Delivery</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600', lineHeight: 1.6, margin: 0 }}>
                  {selectedOrder?.address}<br />
                  <span style={{ color: 'var(--primary)', fontWeight: '800' }}>Pincode: {selectedOrder?.pincode}</span>
                  {selectedOrder?.expectedDelivery && (
                    <>
                      <br />
                      <span style={{ color: 'var(--text-main)', fontWeight: '800' }}>Expected Delivery: {selectedOrder.expectedDelivery}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Products List */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '20px', fontFamily: 'Fraunces, serif' }}>Ordered Items</h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden' }}>
                {selectedOrder?.products?.map((p: any, idx: number) => (
                  <div key={idx} style={{ padding: '20px 30px', background: idx % 2 === 0 ? 'var(--surface)' : 'var(--background)', borderBottom: idx === (selectedOrder.products.length - 1) ? 'none' : '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {p.quantity} × ₹{p.price}</div>
                    </div>
                    <div style={{ fontWeight: '900', color: 'var(--primary)' }}>₹{(p.price * p.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Summary */}
            <div style={{ background: 'var(--secondary)', border: '1px solid var(--border)', padding: '40px', borderRadius: '32px', color: 'var(--text-main)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span>Delivery Charge</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '800' }}>+ ₹{(selectedOrder?.deliveryCharge || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span>Payment Method</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '800' }}>{selectedOrder?.paymentMethod}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>Grand Total</span>
                  <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)' }}>₹{(selectedOrder?.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
              {selectedOrder?.status !== 'Shipped' && selectedOrder?.status !== 'Delivered' && (
                <button 
                  onClick={() => { setShowDetailsModal(false); setShowShipModal(true); }}
                  style={{ flex: 1, background: 'var(--primary)', color: 'white', padding: '20px', borderRadius: '24px', border: 'none', fontWeight: '900', cursor: 'pointer' }}
                >
                  Mark as Shipped
                </button>
              )}
              {selectedOrder?.status === 'Shipped' && (
                <button 
                  onClick={() => updateStatus(selectedOrder._id, 'Delivered')}
                  style={{ flex: 1, background: 'var(--primary)', color: 'white', padding: '20px', borderRadius: '24px', border: 'none', fontWeight: '900', cursor: 'pointer' }}
                >
                  Confirm Delivery
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shipping Details Modal */}
      {showShipModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '40px', borderRadius: '40px', width: '100%', maxWidth: '450px', position: 'relative', color: 'var(--text-main)' }}>
            <button onClick={() => setShowShipModal(false)} style={{ position: 'absolute', right: '30px', top: '30px', background: 'var(--background)', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', color: 'var(--text-main)' }}><X size={20} /></button>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ width: '60px', height: '60px', background: 'var(--secondary)', color: 'var(--primary)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Truck size={30} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)', fontFamily: 'Fraunces, serif' }}>Shipping Details</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Courier Company</label>
                <input 
                  style={{ padding: '16px', borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--background)', outline: 'none', fontWeight: '600', color: 'var(--text-main)' }} 
                  placeholder="e.g. Delhivery, BlueDart" 
                  value={courierInfo.name}
                  onChange={e => setCourierInfo({...courierInfo, name: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tracking ID</label>
                <input 
                  style={{ padding: '16px', borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--background)', outline: 'none', fontWeight: '600', color: 'var(--text-main)' }} 
                  placeholder="Enter tracking number" 
                  value={courierInfo.trackingId}
                  onChange={e => setCourierInfo({...courierInfo, trackingId: e.target.value})}
                />
              </div>
              <button 
                onClick={() => updateStatus(selectedOrder._id, 'Shipped', courierInfo)}
                style={{ background: 'var(--primary)', color: 'white', padding: '20px', borderRadius: '24px', border: 'none', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer' }}
              >
                Confirm Shipment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

