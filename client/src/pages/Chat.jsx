import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

function Chat() {
  const { friendId } = useParams(); // Get friend's ID from URL
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [friend, setFriend] = useState(null);
  const myId = localStorage.getItem("userId");
  const scrollRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        // 1. Get Friend Details (for header)
        const userRes = await axios.get(`http://localhost:5000/api/users/${friendId}`);
        setFriend(userRes.data);

        // 2. Get Messages
        const msgRes = await axios.get(`http://localhost:5000/api/messages/${friendId}`, {
             headers: { Authorization: token }
        });
        setMessages(msgRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();

    // Auto-refresh messages every 3 seconds (Simple "Real-time" effect)
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [friendId]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if(!text) return;
    
    const token = localStorage.getItem("token");
    try {
        // Optimistic Update
        const tempMsg = { sender: myId, text: text, createdAt: Date.now() };
        setMessages([...messages, tempMsg]);
        setText("");

        await axios.post("http://localhost:5000/api/messages", 
            { recipientId: friendId, text: text },
            { headers: { Authorization: token } }
        );
    } catch(err) { console.error(err); }
  };

  return (
    <div className="container" style={{ display:"flex", flexDirection:"column", height:"90vh" }}>
      {/* Header */}
      <div className="card" style={{ padding: "15px", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
        <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
             <Link to="/find-users" className="btn-link">←</Link>
             <h3 style={{margin:0}}>{friend ? friend.username : "Chat"}</h3>
        </div>
      </div>

      {/* Messages Area */}
      <div className="card" style={{ flex: 1, overflowY:"auto", padding:"15px", display:"flex", flexDirection:"column", gap:"10px", background: "#fff" }}>
        {messages.map((m, i) => {
            const isMe = m.sender === myId;
            return (
                <div key={i} ref={scrollRef} style={{
                    alignSelf: isMe ? "flex-end" : "flex-start",
                    background: isMe ? "#3797ef" : "#efefef",
                    color: isMe ? "white" : "black",
                    padding: "8px 15px",
                    borderRadius: "15px",
                    maxWidth: "70%"
                }}>
                    {m.text}
                </div>
            )
        })}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} style={{ display:"flex", gap:"10px" }}>
        <input 
            value={text} 
            onChange={(e)=>setText(e.target.value)} 
            placeholder="Type a message..." 
            style={{marginBottom:0}}
        />
        <button type="submit" className="btn-primary" style={{width:"80px"}}>Send</button>
      </form>
    </div>
  );
}

export default Chat;