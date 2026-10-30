// ← USER page: see the products the admin added, filter, search, paginate, add to cart

import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Pagination from "../../components/Pagination.jsx";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // same API as the admin page. Only the buttons are different.
  const loadProducts = async () => {
    try {
      const { data } = await api.get("/products", {
        params: { page, limit: 6, category, search },
      });
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load products");
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, category, search]);

  useEffect(() => {
    api.get("/products/categories").then((res) => setCategories(res.data));
  }, []);

  // CREATE a cart row (or increase its quantity if it is already there)
  const addToCart = async (productId) => {
    setMessage("");
    setError("");
    try {
      await api.post("/cart", { productId, quantity: 1 });
      setMessage("Added to cart");
    } catch (err) {
      setError(err.response?.data?.message || "Could not add to cart");
    }
  };

  return (
    <div>
      <h2>Shop</h2>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="toolbar">
        <input
          placeholder="Search products"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="product-grid">
        {products.map((p) => (
          <div className="card product" key={p._id}>
            {p.image ? <img src={p.image} alt={p.name} /> : <div className="no-image">No image</div>}
            <h3>{p.name}</h3>
            <p className="muted">{p.category}</p>
            <p className="price">₹{p.price}</p>
            <p className="muted">{p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}</p>
            <button className="btn" disabled={p.stock === 0} onClick={() => addToCart(p._id)}>
              Add to cart
            </button>
          </div>
        ))}
      </div>

      {products.length === 0 && <p className="empty">No products found.</p>}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
};

export default Shop;
