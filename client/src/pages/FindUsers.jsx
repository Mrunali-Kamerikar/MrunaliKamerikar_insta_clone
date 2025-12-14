import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function FindUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const myId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/all/everyone");
        setUsers(res.data.filter((u) => u._id !== myId));
      } catch (err) { console.error(err); }
    };
    fetchUsers();
  }, [myId]);

  const handleFollow = async (id, isFollowing) => {
    const token = localStorage.getItem("token");
    const endpoint = isFollowing ? "unfollow" : "follow";

    setUsers((prev) =>
      prev.map((user) => {
        if (user._id === id) {
          return {
            ...user,
            followers: isFollowing
              ? user.followers.filter((f) => f !== myId)
              : [...user.followers, myId],
          };
        }
        return user;
      })
    );

    try {
      await axios.put(`http://localhost:5000/api/users/${id}/${endpoint}`, {}, {
        headers: { Authorization: token }
      });
    } catch (err) { console.error(err); }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2>Find People</h2>
        <Link to="/" className="btn-link">Back to Feed</Link>
      </div>

      {/* SEARCH BAR */}
      <input 
        placeholder="Search users..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "20px" }}
      />

      <div className="card" style={{ padding: "0" }}>
        {filteredUsers.length === 0 ? (
            <p style={{ padding: "20px", textAlign: "center", color: "gray" }}>No users found.</p>
        ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {filteredUsers.map((user) => {
                const isFollowing = user.followers.includes(myId);
                return (
                <li
                    key={user._id}
                    style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "15px 20px",
                    borderBottom: "1px solid #f0f0f0",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#888" }}>
                            {user.username[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: "600" }}>{user.username}</span>
                    </div>
                    
                    <div style={{ display: "flex", gap: "10px" }}>
                        {/* MESSAGE BUTTON */}
                        <Link 
                            to={`/chat/${user._id}`}
                            style={{
                                padding: "7px 16px",
                                background: "#efefef",
                                color: "black",
                                textDecoration: "none",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center"
                            }}
                        >
                            Msg
                        </Link>

                        {/* FOLLOW BUTTON */}
                        <button
                        onClick={() => handleFollow(user._id, isFollowing)}
                        style={{
                            padding: "7px 16px",
                            background: isFollowing ? "#f0f0f0" : "#3797ef",
                            color: isFollowing ? "black" : "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "13px"
                        }}
                        >
                        {isFollowing ? "Unfollow" : "Follow"}
                        </button>
                    </div>
                </li>
                );
            })}
            </ul>
        )}
      </div>
    </div>
  );
}

export default FindUsers;