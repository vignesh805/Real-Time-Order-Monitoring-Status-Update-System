import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import './admin.css'
import ProductManagement from "./Productmanagement";

const socket = io("http://localhost:4000");
const STATUS_OPTIONS = ["PLACED","ACCEPTED","PACKED","OUT_FOR_DELIVERY","DELIVERED"];

export default function Admin({ user }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const canEditProducts = user.role === "ADMIN";

  useEffect(() => {
    fetch("http://localhost:4000/orders").then(r=>r.json()).then(setOrders);
    socket.on("newOrderPlaced", order => {
      order.isNew = true;
      setOrders(prev => [order, ...prev]);
      setTimeout(() => setOrders(prev => prev.map(o => o.id===order.id?{...o,isNew:false}:o)),5000);
    });
    socket.on("orderStatusUpdated", updated => {
      setOrders(prev => prev.map(o=>o.id===updated.id?updated:o));
      if(selectedOrder?.id===updated.id)setSelectedOrder(updated);
    });
    return()=>{socket.off("newOrderPlaced");socket.off("orderStatusUpdated");}
  },[selectedOrder]);

 const updateStatus = (id, status) => {
  fetch(`http://localhost:4000/orders/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  })
    .then(res => res.json())
    .then(updatedOrder => {
      setOrders(prev =>
        prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    });
};


  const filteredOrders = orders.filter(o=>{
    const matchesFilter = filter==="ALL" || 
      (filter==="TODAY" && new Date(o.createdAt).toDateString()===new Date().toDateString())||
      (filter==="DELIVERED" && o.status==="DELIVERED")||
      (filter==="PENDING" && o.status!=="DELIVERED");
    const matchesSearch = o.orderNumber.toString().includes(search) || o.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="admin-container">
      <h2>Welcome, {user.username} ({user.role})</h2>
      <div className="admin-header">
        <input placeholder="Search by order #" value={search} onChange={e=>setSearch(e.target.value)}/>
        <select value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="ALL">All</option>
          <option value="TODAY">Today</option>
          <option value="DELIVERED">Delivered</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>
      <div className="orders-list">
        {filteredOrders.map(o=>(
          <div key={o.id} className={`order-item ${o.isNew?"new":""}`} onClick={()=>setSelectedOrder(o)}>
            <span>#{o.orderNumber}-{o.customerName}</span>
            <span>{o.status}</span>
          </div>
        ))}
      </div>
      {selectedOrder && (
        <div className="order-details">
          <h3>Order #{selectedOrder.orderNumber}</h3>
          <p><strong>Customer:</strong>{selectedOrder.customerName}</p>
          <p><strong>Phone:</strong>{selectedOrder.phone}</p>
          <p><strong>Address:</strong>{selectedOrder.address}</p>
          <h4>Items:</h4>
          <ul>{selectedOrder.items.map(item=><li key={item.id}>{item.name} x {item.quantity} = ₹{item.price*item.quantity}</li>)}</ul>
          <p><strong>Total:</strong> ₹{selectedOrder.total}</p>
          <label>Status:</label>
          <select value={selectedOrder.status} onChange={e=>updateStatus(selectedOrder.id,e.target.value)} disabled={user.role!=="ADMIN" && user.role!=="STAFF"}>
            {STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
      {canEditProducts && <ProductManagement />}
    </div>
  );
}
