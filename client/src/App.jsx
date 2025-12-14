import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import FindUsers from "./pages/FindUsers";
import Profile from "./pages/Profile"; 
import Chat from "./pages/Chat";

// Protection Logic
const ProtectedRoute = ({ children }) => {
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        } />
        
        <Route path="/find-users" element={
          <ProtectedRoute>
            <FindUsers />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/chat/:friendId" element={<Chat />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;