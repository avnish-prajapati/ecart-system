// ← ADMIN page: add, edit, delete products + category filter + search + pagination

import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Pagination from "../../components/Pagination.jsx";

// an empty form, used for "Add" and to reset after saving
const emptyForm = { name: "", price: "", category: "", image: "", stock: "" };

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState(""); // filter
  const [search, setSearch] = useState("");     // filter
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = we are adding, id = we are editing
  const [error, setError] = useState("");

  // READ: ask the backend for one page of products (with the current filters)
  const loadProducts = async () => {
    try {
      const { data } = await api.get("/products", {
        params: { page, limit: 5, category, search }, // becomes ?page=1&limit=5&category=...
      });
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load products");
    }
  };

  const loadCategories = async () => {
    const { data } = await api.get("/products/categories");
    setCategories(data);
  };

  // run loadProducts again whenever the page or a filter changes
  useEffect(() => {
    loadProducts();
  }, [page, category, search]);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // CREATE or UPDATE (same form, depends on editingId)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // inputs give text, but the backend needs numbers for price and stock
    const body = { ...form, price: Number(form.price), stock: Number(form.stock || 0) };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, body);
      } else {
        await api.post("/products", body);
      }
      setForm(emptyForm);
      setEditingId(null);
      loadProducts();
      loadCategories(); // a new category may have been added
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the product");
    }
  };

  // put the product's values into the form so the admin can change them
  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({ name: p.name, price: p.price, category: p.category, image: p.image, stock: p.stock });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete the product");
    }
  };

  return (
    <div>
      <h2>Manage products</h2>
      {error && <p className="error">{error}</p>}

      {/* ---------- add / edit form ---------- */}
      <div className="card">
        <h3>{editingId ? "Edit product" : "Add a product"}</h3>
        <form onSubmit={handleSubmit} className="grid-form">
          <div>
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label>Price (₹)</label>
            <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required />
          </div>
          <div>
            <label>Category</label>
            <input name="category" value={form.category} onChange={handleChange} required />
          </div>
          <div>
            <label>Stock</label>
            <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} />
          </div>
          <div className="span-2">
            <label>Image link (optional)</label>
            <input name="image" value={form.image} onChange={handleChange} />
          </div>
          <div className="span-2 row">
            <button className="btn" type="submit">{editingId ? "Save changes" : "Add product"}</button>
            {editingId && <button className="btn btn-light" type="button" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* ---------- filters ---------- */}
      <div className="toolbar">
        <input
          placeholder="Search by name"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} // go back to page 1 when the filter changes
        />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* ---------- product table ---------- */}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.image ? <img src={p.image} alt={p.name} className="thumb" /> : "-"}</td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>₹{p.price}</td>
                <td>{p.stock}</td>
                <td className="row">
                  <button className="btn btn-light" onClick={() => startEdit(p)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan="6" className="empty">No products found. Add your first product above.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
};

export default AdminProducts;
