import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  
  const [commentsData, setCommentsData] = useState({}); 
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});
  
  const myId = localStorage.getItem("userId"); // Get My ID for ownership checks

  useEffect(() => { fetchFeed(); }, []);

  const fetchFeed = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts/feed", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setPosts(res.data);
    } catch (err) { console.error(err); }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/posts", { caption, imageUrl }, {
        headers: { Authorization: localStorage.getItem("token") }
      });
      setCaption(""); setImageUrl("");
      fetchFeed();
    } catch (err) { alert("Error creating post"); }
  };

  const handleLike = async (postId) => {
    setPosts(posts.map(post => {
      if (post._id === postId) {
        const isLiked = post.likes.includes(myId);
        return { ...post, likes: isLiked ? post.likes.filter(id => id !== myId) : [...post.likes, myId] };
      }
      return post;
    }));
    try {
      await axios.put(`http://localhost:5000/api/posts/${postId}/like`, {}, {
        headers: { Authorization: localStorage.getItem("token") }
      });
    } catch (err) { fetchFeed(); }
  };

  // --- DELETE LOGIC ---
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return; // Confirm dialog
    try {
        await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
            headers: { Authorization: localStorage.getItem("token") }
        });
        // Remove from UI immediately
        setPosts(posts.filter(p => p._id !== postId));
    } catch (err) { alert("Error deleting post"); }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
        await axios.delete(`http://localhost:5000/api/posts/comments/${commentId}`, {
            headers: { Authorization: localStorage.getItem("token") }
        });
        // Remove from UI immediately
        setCommentsData(prev => ({
            ...prev,
            [postId]: prev[postId].filter(c => c._id !== commentId)
        }));
    } catch (err) { alert("Error deleting comment"); }
  };

  // --- COMMENT LOGIC ---
  const toggleComments = async (postId) => {
    if (showComments[postId]) {
        setShowComments(prev => ({ ...prev, [postId]: false }));
        return;
    }
    try {
        const res = await axios.get(`http://localhost:5000/api/posts/${postId}/comments`);
        setCommentsData(prev => ({ ...prev, [postId]: res.data }));
        setShowComments(prev => ({ ...prev, [postId]: true }));
    } catch (err) { console.error(err); }
  };

  const submitComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text) return;
    try {
        const res = await axios.post(`http://localhost:5000/api/posts/${postId}/comment`, 
            { text }, 
            { headers: { Authorization: localStorage.getItem("token") } }
        );
        setCommentsData(prev => ({ ...prev, [postId]: [...(prev[postId] || []), res.data] }));
        setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="container">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontFamily: "cursive", fontSize: "28px", margin: 0 }}>InstaClone</h2>
        <div style={{ display: "flex", gap: "15px" }}>
            <Link to="/find-users" className="btn-link">🔍 Find</Link>
            <Link to="/profile" className="btn-link">👤 Profile</Link>
            <button onClick={() => {localStorage.clear(); window.location.href="/login"}} className="btn-link" style={{color: "red"}}>Logout</button>
        </div>
      </div>

      {/* Create Post Card */}
      <div className="card" style={{ padding: "20px" }}>
        <h4 style={{ margin: "0 0 10px 0" }}>New Post</h4>
        <form onSubmit={handlePost}>
          <input 
            placeholder="Paste Image URL..." 
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <input 
              placeholder="Write a caption..." 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <button type="submit" className="btn-primary" style={{ width: "100px" }}>Post</button>
          </div>
        </form>
      </div>

      {/* Feed */}
      {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "gray" }}>
              <h3>Your feed is empty 😴</h3>
          </div>
      ) : (
          posts.map((post) => {
              const isLiked = post.likes.includes(myId);
              // CHECK OWNERSHIP
              const isMyPost = post.author?._id === myId || post.author === myId; 

              return (
                <div key={post._id} className="card">
                    {/* Post Header */}
                    <div style={{ padding: "12px 15px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #efefef" }}>
                        <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#3797ef", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold" }}>
                                {post.author?.username?.[0]?.toUpperCase() || "?"}
                            </div>
                            <span style={{ fontWeight: "600" }}>{post.author?.username}</span>
                        </div>
                        
                        {/* DELETE POST BUTTON (Only if I own it) */}
                        {isMyPost && (
                            <button 
                                onClick={() => handleDeletePost(post._id)}
                                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
                                title="Delete Post"
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                    
                    <img 
                        src={post.imageUrl} 
                        className="post-image"
                        alt="Post"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/500x400?text=Image+Not+Found"; }}
                    />
                    
                    <div style={{ padding: "12px 15px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "8px" }}>
                            <button onClick={() => handleLike(post._id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "24px", padding: 0 }}>
                                {isLiked ? "❤️" : "🤍"}
                            </button>
                            <button onClick={() => toggleComments(post._id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "24px", padding: 0, transform: "scaleX(-1)" }}>
                                💬
                            </button>
                        </div>
                        <p style={{ margin: "0 0 8px 0" }}><strong>{post.likes.length} likes</strong></p>
                        
                        <div style={{ marginBottom: "5px" }}>
                            <span style={{ fontWeight: "600", marginRight: "6px" }}>{post.author?.username}</span>
                            <span>{post.caption}</span>
                        </div>

                        <button 
                            onClick={() => toggleComments(post._id)}
                            style={{ background: "none", border: "none", padding: 0, color: "gray", cursor: "pointer", fontSize: "14px", marginBottom: "10px" }}
                        >
                            {showComments[post._id] ? "Hide comments" : "View all comments"}
                        </button>

                        {/* Comments Section */}
                        {showComments[post._id] && (
                            <div style={{ marginBottom: "15px" }}>
                                {commentsData[post._id]?.map((c, i) => (
                                    <div key={i} style={{ marginBottom: "5px", fontSize: "14px", display: "flex", justifyContent: "space-between" }}>
                                        <div>
                                            <span style={{ fontWeight: "600", marginRight: "5px" }}>{c.username}</span>
                                            <span>{c.text}</span>
                                        </div>
                                        
                                        {/* DELETE COMMENT BUTTON (Only if I own it) */}
                                        {c.userId === myId && (
                                            <button 
                                                onClick={() => handleDeleteComment(post._id, c._id)}
                                                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "10px", color: "red" }}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {commentsData[post._id]?.length === 0 && <p style={{ fontSize: "12px", color: "gray" }}>No comments yet.</p>}
                            </div>
                        )}

                        <div style={{ display: "flex", borderTop: "1px solid #efefef", paddingTop: "15px" }}>
                            <input 
                                placeholder="Add a comment..." 
                                value={commentInputs[post._id] || ""}
                                onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                                style={{ border: "none", padding: "0", margin: 0, fontSize: "14px" }}
                            />
                            <button 
                                onClick={() => submitComment(post._id)}
                                style={{ border: "none", background: "none", color: "#3797ef", fontWeight: "600", cursor: "pointer" }}
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </div>
              );
          })
      )}
    </div>
  );
}

export default Feed;