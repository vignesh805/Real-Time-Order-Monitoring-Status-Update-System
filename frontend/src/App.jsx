import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login";
import Admin from "./Admin";
import Products from "./Products";
import Checkout from "./Checkout";
import Track from "./Track";

function App(){
  const [user,setUser]=useState(null);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Products />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/track/:id" element={<Track />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/admin" element={user?<Admin user={user}/>:<Navigate to="/login"/>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
