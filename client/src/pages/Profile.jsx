import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [modalType, setModalType] = useState('none'); 
  const [listData, setListData] = useState([]); 

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      try {
        const userRes = await axios.get(`http://localhost:5000/api/users/${userId}`);
        setUser(userRes.data);

        const postsRes = await axios.get("http://localhost:5000/api/posts/profile/mine", {
            headers: { Authorization: token }
        });
        setPosts(postsRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const openList = async (type) => {
    if (type === 'none') {
        setModalType('none'); 
        return;
    }
    try {
        const res = await axios.get("http://localhost:5000/api/users/all/everyone");
        // Filter: Only show users whose IDs are in my followers/following list
        const idsToFind = type === 'followers' ? user.followers : user.following;
        const filtered = res.data.filter(u => idsToFind.includes(u._id));
        
        setListData(filtered);
        setModalType(type);
    } catch (err) { console.error(err); }
  };

  // --- NEW: Handle Unfollow from Modal ---
  const handleUnfollow = async (targetId) => {
    const token = localStorage.getItem("token");

    // 1. Optimistic Update (Remove from the visible list instantly)
    setListData((prev) => prev.filter((u) => u._id !== targetId));

    // 2. Update the Stats Count (Following number goes down)
    setUser((prev) => ({
        ...prev,
        following: prev.following.filter((id) => id !== targetId)
    }));

    // 3. API Call
    try {
        await axios.put(`http://localhost:5000/api/users/${targetId}/unfollow`, {}, {
            headers: { Authorization: token }
        });
    } catch (err) {
        console.error(err);
        alert("Error unfollowing");
    }
  };

  if (!user) return <div className="container" style={{textAlign:"center", marginTop:"50px"}}>Loading...</div>;

  return (
    <div className="container">
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>{user.username}</h2>
        <Link to="/" className="btn-link">🏠 Home</Link>
      </div>

      {/* Stats Header */}
      <div style={{ display: "flex", justifyContent: "space-around", borderBottom: "1px solid #dbdbdb", paddingBottom: "20px", marginBottom: "20px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: "bold", fontSize: "18px" }}>{posts.length}</div>
          <div style={{ color: "gray" }}>Posts</div>
        </div>
        <div style={{ textAlign: "center", cursor: "pointer" }} onClick={() => openList('followers')}>
          <div style={{ fontWeight: "bold", fontSize: "18px" }}>{user.followers.length}</div>
          <div style={{ color: "gray" }}>Followers</div>
        </div>
        <div style={{ textAlign: "center", cursor: "pointer" }} onClick={() => openList('following')}>
          <div style={{ fontWeight: "bold", fontSize: "18px" }}>{user.following.length}</div>
          <div style={{ color: "gray" }}>Following</div>
        </div>
      </div>

      {/* Photo Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "5px" }}>
        {posts.length === 0 ? <p style={{gridColumn: "span 3", textAlign:"center", color:"gray"}}>No posts yet.</p> : 
          posts.map(post => (
          <img 
            key={post._id} 
            src={post.imageUrl} 
            alt="Mine"
            style={{ width: "100%", height: "150px", objectFit: "cover", cursor: "pointer" }}
            onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
          />
        ))}
      </div>

      {/* MODAL for Lists */}
      {modalType !== 'none' && (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1000,
            background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
        }}>
            <div style={{ background: "white", width: "320px", borderRadius: "12px", padding: "20px", maxHeight: "80vh", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                    <h3 style={{ margin: 0, textTransform: "capitalize" }}>{modalType}</h3>
                    <button onClick={() => openList('none')} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
                </div>
                
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {listData.map(u => (
                        <li key={u._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                            <span style={{ fontWeight: "600" }}>{u.username}</span>
                            
                            {/* ONLY SHOW BUTTON IF IN FOLLOWING LIST */}
                            {modalType === 'following' && (
                                <button 
                                    onClick={() => handleUnfollow(u._id)}
                                    style={{
                                        border: "1px solid #dbdbdb",
                                        background: "white",
                                        color: "black",
                                        padding: "5px 10px",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        fontWeight: "600"
                                    }}
                                >
                                    Unfollow
                                </button>
                            )}
                        </li>
                    ))}
                    {listData.length === 0 && <p style={{color:"gray", textAlign: "center"}}>List is empty.</p>}
                </ul>
            </div>
        </div>
      )}
    </div>
  );
}

export default Profile;