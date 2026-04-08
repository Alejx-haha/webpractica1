import { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

const API = "http://3.144.147.255:8000/products";

function App() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image_url: ""
  });

  // Cargar productos
  const loadProducts = () => {
    axios.get(API).then(res => setProducts(res.data));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Crear o actualizar
  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock)
    };

    if (editingId) {
      axios.put(`${API}/${editingId}`, data).then(() => {
        setEditingId(null);
        resetForm();
        loadProducts();
      });
    } else {
      axios.post(API, data).then(() => {
        resetForm();
        loadProducts();
      });
    }
  };

  // Editar producto
  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      image_url: product.image_url || ""
    });
  };

  // Eliminar
  const deleteProduct = (id) => {
    axios.delete(`${API}/${id}`).then(loadProducts);
  };

  // Reset form
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      image_url: ""
    });
  };

  return (
    <div className="container">
      <h1>🛒 Ecommerce</h1>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Nombre"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Descripción"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <input
          placeholder="Precio"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
        />
        <input
          placeholder="Stock"
          value={form.stock}
          onChange={e => setForm({ ...form, stock: e.target.value })}
        />
        <input
          placeholder="Imagen URL"
          value={form.image_url}
          onChange={e => setForm({ ...form, image_url: e.target.value })}
        />

        <button type="submit">
          {editingId ? "Actualizar" : "Crear"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              resetForm();
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      <hr />

      {/* LISTA DE PRODUCTOS */}
      {products.map(p => (
        <div key={p.id} className="product">
          <h3>{p.name}</h3>
          <p>{p.description}</p>
          <p>💲 {p.price}</p>
          <p>Stock: {p.stock}</p>

          {p.image_url && (
            <img src={p.image_url} alt={p.name} width="120" />
          )}

          <br />

          <button onClick={() => handleEdit(p)}>
            ✏️ Editar
          </button>

          <button onClick={() => deleteProduct(p.id)}>
            🗑️ Eliminar
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
