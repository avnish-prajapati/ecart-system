// ← USER page: the cart. Change quantity (+/-), remove, filter by category, paginate.

import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Pagination from "../../components/Pagination.jsx";

const Cart = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("");
  const [cartTotal, setCartTotal] = useState(0);
  const [error, setError] = useState("");

  // READ the cart
  const loadCart = async () => {
    try {
      const { data } = await api.get("/cart", { params: { page, limit: 5, category } });
      setItems(data.items);
      setTotalPages(data.totalPages);
      setCartTotal(data.cartTotal);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load the cart");
    }
  };

  useEffect(() => {
    loadCart();
  }, [page, category]);

  useEffect(() => {
    api.get("/products/categories").then((res) => setCategories(res.data));
  }, []);

  // UPDATE the quantity of one cart row
  const changeQuantity = async (item, newQty) => {
    setError("");
    if (newQty < 1) return; // to remove an item, use the Remove button
    try {
      await api.put(`/cart/${item._id}`, { quantity: newQty });
      loadCart();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update the quantity");
    }
  };

  // DELETE one cart row
  const removeItem = async (id) => {
    try {
      await api.delete(`/cart/${id}`);
      // if we removed the last item of this page, go one page back
      if (items.length === 1 && page > 1) setPage(page - 1);
      else loadCart();
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove the item");
    }
  };

  return (
    <div>
      <h2>My cart</h2>
      {error && <p className="error">{error}</p>}

      <div className="toolbar">
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Product</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              // product can be missing only if it was deleted, so we check it first
              item.product && (
                <tr key={item._id}>
                  <td className="row">
                    {item.product.image && <img src={item.product.image} alt="" className="thumb" />}
                    <div>
                      <strong>{item.product.name}</strong>
                      <div className="muted">{item.product.category}</div>
                    </div>
                  </td>
                  <td>₹{item.product.price}</td>
                  <td>
                    <div className="qty">
                      <button className="btn btn-light" onClick={() => changeQuantity(item, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button className="btn btn-light" onClick={() => changeQuantity(item, item.quantity + 1)}>+</button>
                    </div>
                  </td>
                  <td>₹{item.product.price * item.quantity}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => removeItem(item._id)}>Remove</button>
                  </td>
                </tr>
              )
            ))}
            {items.length === 0 && (
              <tr><td colSpan="5" className="empty">Your cart is empty. Add something from the shop.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <p className="total">Cart total: ₹{cartTotal}</p>
    </div>
  );
};

export default Cart;
