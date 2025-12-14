import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      // 🔥 SAVE THE TOKEN (CRITICAL)
      localStorage.setItem("token", res.data.token); 
      localStorage.setItem("userId", res.data._id); // Save ID for later use
      
      navigate("/"); // Go to Feed
    } catch (err) {
      alert("Login Failed");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input 
          placeholder="Email" 
          onChange={(e) => setForm({ ...form, email: e.target.value })} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setForm({ ...form, password: e.target.value })} 
        />
        <button type="submit">Login</button>
      </form>
      <p>No account? <Link to="/register">Register</Link></p>
    </div>
  );
}

export default Login;