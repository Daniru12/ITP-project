import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const DeleteProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user's products
  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    
    // Check if token exists
    if (!token) {
      toast.error('Please login to view your products');
      navigate('/login');
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await axios.get(`${backendUrl}/api/products/own`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Error fetching products');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [navigate]);

  // Handle product deletion
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('Please login to delete products');
      navigate('/login');
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      await axios.delete(`${backendUrl}/api/products/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Product deleted successfully');
      window.location.reload(); // Refresh page
    } catch (error) {
      console.error('Error deleting product:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Your Products</h1>
        <Link
          to="/create-product"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Create New Product
        </Link>
      </div>
      <div className="w-full max-w-4xl overflow-x-auto">
        <table className="w-full bg-white shadow-lg rounded-lg">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="p-2">Name</th>
              <th className="p-2">Price</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Category</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4">No products found.</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="border p-2">{product.name}</td>
                  <td className="border p-2">Rs.{product.price.toFixed(2)}</td>
                  <td className="border p-2">{product.quantity}</td>
                  <td className="border p-2">{product.category}</td>
                  <td className="border p-2">
                    <Link
                      to={`/update-product/${product._id}`}
                      className="text-blue-500 hover:text-blue-700 mr-4"
                      state={{ product }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeleteProducts;
