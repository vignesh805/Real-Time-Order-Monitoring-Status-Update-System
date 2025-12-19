import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CartDrawer from "./cartdrawer";
import "./Products.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [openCart, setOpenCart] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:4000/products")
      .then(res => res.json())
      .then(setProducts);
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  return (
    <div className="products-page">
      {/* ================= HEADER ================= */}
      <div className="products-header">
        <input
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <button onClick={() => navigate("/login")}>
          Admin Login
        </button>

        <button onClick={() => setOpenCart(true)}>
          Cart ({cart.length})
        </button>
      </div>

      {/* ================= PRODUCTS ================= */}
      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <p className="no-products">No products found.</p>
        ) : (
          filteredProducts.map(p => (
            <div className="product-card" key={p.id}>
              <img src={`http://localhost:4000${p.imageUrl}`} />
              <h4>{p.name}</h4>
              <p className="desc">{p.description}</p>
              <p className="price">₹{p.price}</p>
              <p className={p.stock > 0 ? "in-stock" : "out-stock"}>
                {p.stock > 0 ? "Available" : "Out of stock"}
              </p>

              <button
                disabled={p.stock === 0}
                onClick={() => addToCart(p)}
              >
                Add to Cart
              </button>
            </div>
          ))
        )}
      </div>

    
      <CartDrawer
        isOpen={openCart}
        onClose={() => setOpenCart(false)}
        cartItems={cart}
        onRemove={(id) =>
          setCart(prev => prev.filter(i => i.id !== id))
        }
      />
    </div>
  );
}
