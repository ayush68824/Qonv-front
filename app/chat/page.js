"use client";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Peer } from "peerjs";
import Image from "next/image";

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://qonv-back.onrender.com";

export default function ChatPage() {
  const [username, setUsername] = useState("");
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [partner, setPartner] = useState(null);
  const [usersOnline, setUsersOnline] = useState(0);
  const [status, setStatus] = useState("connecting");
  const [darkMode, setDarkMode] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [reconnectCountdown, setReconnectCountdown] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Video call states
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState(null); // 'video' or 'audio'
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCall, setIncomingCall] = useState(null);
  
  // Refs
  const chatRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const callTimerRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  // Load username from localStorage
  useEffect(() => {
    const uname = localStorage.getItem("qonvoo_username");
    if (!uname) {
      window.location.href = "/";
    } else {
      setUsername(uname);
    }
  }, []);

  // Initialize PeerJS
  useEffect(() => {
    if (username) {
      const peer = new Peer(`${username}_${Date.now()}`, {
        host: 'peerjs-server.herokuapp.com',
        port: 443,
        secure: true,
        config: {
          'iceServers': [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      peer.on('open', (id) => {
        console.log('PeerJS connected:', id);
      });

      peer.on('call', (call) => {
        handleIncomingCall(call);
      });

      peerRef.current = peer;
    }
  }, [username]);

  // Connect to socket
  useEffect(() => {
    if (!username) return;
    const s = io(SOCKET_URL, {
      query: { username },
      transports: ["websocket"],
      withCredentials: true,
    });
    setSocket(s);
    s.on("connect", () => setStatus("connected"));
    s.on("matched", ({ username: partnerName }) => {
      setPartner(partnerName);
      setMessages((msgs) => [
        ...msgs,
        { system: true, text: `You are now connected with ${partnerName}` },
      ]);
      setStatus("chatting");
    });
    s.on("waiting", () => {
      setPartner(null);
      setStatus("waiting");
      setMessages((msgs) => [
        ...msgs,
        { system: true, text: "Searching for a new user... reconnecting in 5 seconds..." },
      ]);
      setReconnectCountdown(5);
    });
    s.on("message", (msg) => {
      setMessages((msgs) => [...msgs, msg]);
    });
    s.on("media_message", (msg) => {
      setMessages((msgs) => [...msgs, msg]);
    });
    s.on("users_online", (count) => setUsersOnline(count));
    
    // WebRTC signaling events
    s.on("call_request", (data) => {
      setIncomingCall({
        from: data.from,
        peerId: data.peerId,
        type: data.type
      });
    });
    
    s.on("call_answer", (data) => {
      if (data.accepted) {
        setIsCallActive(true);
        startCallTimer();
      } else {
        setIsInCall(false);
        setCallType(null);
      }
    });
    
    s.on("call_ice_candidate", (data) => {
      if (peerRef.current && remoteStreamRef.current) {
        peerRef.current.signal(data.candidate);
      }
    });
    
    s.on("call_end", (data) => {
      endCall();
    });
    
    return () => s.disconnect();
  }, [username]);

  // Analytics fetch
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${SOCKET_URL}/analytics`);
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Reconnect countdown
  useEffect(() => {
    if (status === "waiting" && reconnectCountdown > 0) {
      const timer = setTimeout(() => setReconnectCountdown(reconnectCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (status === "waiting" && reconnectCountdown === 0 && socket) {
      socket.emit("skip");
    }
  }, [status, reconnectCountdown, socket]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Dark mode toggle
  const handleToggle = () => {
    setDarkMode((prev) => !prev);
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", !darkMode);
    }
  };

  // Send message
  const sendMessage = () => {
    if (input.trim() && socket && partner) {
      socket.emit("message", input);
      setMessages((msgs) => [
        ...msgs,
        { from: username, msg: input, ts: Date.now() },
      ]);
      setInput("");
    }
  };

  // Upload file to Cloudinary
  const uploadFile = async (file) => {
    if (!file || !socket || !partner) return;

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only images and audio files are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum 10MB allowed.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${SOCKET_URL}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (result.success) {
        // Send media message via socket
        const mediaType = file.type.startsWith('image/') ? 'image' : 'audio';
        socket.emit('media_message', {
          url: result.url,
          type: mediaType
        });

        // Add to local messages
        setMessages((msgs) => [
          ...msgs,
          { 
            from: username, 
            url: result.url, 
            type: mediaType, 
            ts: Date.now() 
          },
        ]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle image upload
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  // Handle audio recording
  const handleAudio = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Audio recording not supported in this browser.');
      return;
    }

    if (isRecording) {
      // Stop recording
      if (audioRecorderRef.current) {
        audioRecorderRef.current.stop();
        setIsRecording(false);
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioRecorderRef.current = mediaRecorder;
        
        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          const file = new File([blob], 'audio.wav', { type: 'audio/wav' });
          uploadFile(file);
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Audio recording error:', error);
        alert('Failed to start audio recording.');
      }
    }
  };

  // Video call functions
  const startVideoCall = async () => {
    if (!peerRef.current || !socket || !partner) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsInCall(true);
      setCallType('video');
      
      // Send call request
      socket.emit('call_request', {
        peerId: peerRef.current.id,
        type: 'video'
      });
      
    } catch (error) {
      console.error('Failed to start video call:', error);
      alert('Failed to access camera/microphone.');
    }
  };

  const startAudioCall = async () => {
    if (!peerRef.current || !socket || !partner) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });
      
      localStreamRef.current = stream;
      setIsInCall(true);
      setCallType('audio');
      
      // Send call request
      socket.emit('call_request', {
        peerId: peerRef.current.id,
        type: 'audio'
      });
      
    } catch (error) {
      console.error('Failed to start audio call:', error);
      alert('Failed to access microphone.');
    }
  };

  const handleIncomingCall = async (call) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: call.metadata?.type === 'video', 
        audio: true 
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      call.answer(stream);
      call.on('stream', (remoteStream) => {
        remoteStreamRef.current = remoteStream;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });
      
      setIsInCall(true);
      setCallType(call.metadata?.type || 'audio');
      setIsCallActive(true);
      startCallTimer();
      
    } catch (error) {
      console.error('Failed to answer call:', error);
      call.close();
    }
  };

  const answerCall = async (accepted) => {
    if (!incomingCall) return;
    
    if (accepted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: incomingCall.type === 'video', 
          audio: true 
        });
        
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        const call = peerRef.current.call(incomingCall.peerId, stream, {
          metadata: { type: incomingCall.type }
        });
        
        call.on('stream', (remoteStream) => {
          remoteStreamRef.current = remoteStream;
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
        
        setIsInCall(true);
        setCallType(incomingCall.type);
        setIsCallActive(true);
        startCallTimer();
        
      } catch (error) {
        console.error('Failed to answer call:', error);
      }
    }
    
    socket.emit('call_answer', {
      peerId: peerRef.current.id,
      accepted
    });
    
    setIncomingCall(null);
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => track.stop());
      remoteStreamRef.current = null;
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    setIsInCall(false);
    setIsCallActive(false);
    setCallType(null);
    setCallDuration(0);
    
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    
    socket.emit('call_end');
  };

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  // Skip partner
  const handleSkip = () => {
    if (socket) {
      socket.emit("skip");
      setStatus("waiting");
      setReconnectCountdown(5);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("qonvoo_username");
    window.location.href = "/";
  };

  // Emoji picker
  const handleEmoji = (emoji) => {
    setInput(input + emoji);
    setShowEmoji(false);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format call duration
  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? "bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526]" : "bg-gradient-to-br from-blue-200 via-pink-100 to-purple-200"}`}>
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Image src="/qonvoo-logo.png" alt="Qonvoo Logo" width={100} height={40} className="dark:invert" />
          <div className="text-lg text-gray-900 dark:text-gray-400">• Global Chat</div>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 rounded-full glass text-sm font-medium shadow-md text-gray-900 dark:text-gray-100">{usersOnline} Users Online Now</span>
          <button onClick={handleToggle} className="p-2 rounded-full shadow-lg bg-white/70 dark:bg-black/40 backdrop-blur hover:scale-110 transition-transform">
            {darkMode ? <span role="img" aria-label="Light mode">🌞</span> : <span role="img" aria-label="Dark mode">🌙</span>}
          </button>
          <button onClick={handleLogout} className="ml-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 via-pink-400 to-purple-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform">Logout</button>
        </div>
      </div>

      {/* Video Call Interface */}
      {isInCall && (
        <div className="absolute inset-0 z-40 bg-black/90 flex items-center justify-center">
          <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-xl"
            />
            
            {/* Local Video */}
            {callType === 'video' && (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute top-4 right-4 w-32 h-24 object-cover rounded-lg border-2 border-white"
              />
            )}
            
            {/* Call Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
              {isCallActive && (
                <div className="px-3 py-1 bg-black/50 text-white rounded-full text-sm">
                  {formatCallDuration(callDuration)}
                </div>
              )}
              <button
                onClick={endCall}
                className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                📞
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="glass p-6 rounded-xl text-center">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              Incoming {incomingCall.type === 'video' ? 'Video' : 'Audio'} Call
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {incomingCall.from} is calling...
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => answerCall(true)}
                className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => answerCall(false)}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat box */}
      <div className="flex-1 flex flex-col items-center justify-center px-2 md:px-0">
        <div className="w-full max-w-2xl h-[60vh] md:h-[70vh] glass overflow-y-auto p-4 rounded-2xl shadow-xl mb-4 transition-all" ref={chatRef}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-pulse">Connecting...</div>
          )}
          {messages.map((msg, i) =>
            msg.system ? (
              <div key={i} className="text-center text-xs text-blue-500 my-2 animate-fade-in">{msg.text}</div>
            ) : (
              <div key={i} className={`flex flex-col ${msg.from === username ? "items-end" : "items-start"} mb-2 animate-fade-in`}>
                <span className="text-xs text-gray-400 mb-1">{msg.from === username ? "You" : partner || "Stranger"} • {formatTime(msg.ts)}</span>
                {msg.type === 'image' ? (
                  <div className={`px-2 py-1 rounded-2xl ${msg.from === username ? "bg-blue-500" : "bg-white/80 dark:bg-black/40"} shadow-md`}>
                    <img src={msg.url} alt="Shared image" className="max-w-xs rounded-lg" />
                  </div>
                ) : msg.type === 'audio' ? (
                  <div className={`px-2 py-1 rounded-2xl ${msg.from === username ? "bg-blue-500" : "bg-white/80 dark:bg-black/40"} shadow-md`}>
                    <audio controls className="max-w-xs">
                      <source src={msg.url} type="audio/wav" />
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                ) : (
                  <span className={`px-4 py-2 rounded-2xl ${msg.from === username ? "bg-blue-500 text-white" : "bg-white/80 dark:bg-black/40 text-gray-900 dark:text-gray-100"} shadow-md max-w-xs break-words`}>{msg.msg}</span>
                )}
              </div>
            )
          )}
        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="mb-2 w-full max-w-2xl">
            <div className="bg-white/80 dark:bg-black/40 rounded-xl p-2">
              <div className="text-xs text-center mb-1">Uploading...</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Message input area */}
        <div className="flex items-center gap-2 w-full max-w-2xl">
          <button onClick={() => setShowEmoji((v) => !v)} className="p-2 bg-white/80 dark:bg-black/30 rounded-full shadow hover:scale-110 transition-transform">😊</button>
          {showEmoji && (
            <div className="absolute bottom-24 left-4 bg-white dark:bg-black border rounded-xl p-2 shadow-lg z-10 flex gap-1">
              {["😀","😂","😍","😎","😭","👍","🎉"].map(e => (
                <button key={e} onClick={() => handleEmoji(e)} className="text-2xl hover:scale-125 transition-transform">{e}</button>
              ))}
            </div>
          )}
          <label className="p-2 bg-white/80 dark:bg-black/30 rounded-full shadow hover:scale-110 transition-transform cursor-pointer">
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImage}
              disabled={uploading || status !== "chatting"}
            />
            <span role="img" aria-label="Attach photo">📎</span>
          </label>
          <button 
            onClick={handleAudio} 
            className={`p-2 rounded-full shadow transition-transform ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/80 dark:bg-black/30 hover:scale-110'}`}
            disabled={uploading || status !== "chatting"}
          >
            {isRecording ? '⏹️' : '🎤'}
          </button>
          <button 
            onClick={startVideoCall} 
            className="p-2 bg-white/80 dark:bg-black/30 rounded-full shadow hover:scale-110 transition-transform"
            disabled={status !== "chatting" || isInCall}
          >
            📹
          </button>
          <button 
            onClick={startAudioCall} 
            className="p-2 bg-white/80 dark:bg-black/30 rounded-full shadow hover:scale-110 transition-transform"
            disabled={status !== "chatting" || isInCall}
          >
            📞
          </button>
          <input
            type="text"
            className="flex-1 px-4 py-3 rounded-xl bg-white/80 dark:bg-black/30 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-pink-400 text-lg shadow-inner"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={status !== "chatting" || uploading}
            maxLength={500}
          />
          <button
            onClick={sendMessage}
            className="py-3 px-5 rounded-xl bg-gradient-to-r from-blue-500 via-pink-400 to-purple-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-pink-400"
            disabled={!input.trim() || status !== "chatting" || uploading}
          >
            Send
          </button>
          <button
            onClick={handleSkip}
            className="py-3 px-5 rounded-xl bg-gradient-to-r from-gray-400 via-gray-500 to-gray-700 text-white font-semibold shadow-lg hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
            disabled={status !== "chatting" || uploading}
          >
            Skip
          </button>
        </div>
        {/* Reconnecting shimmer */}
        {status === "waiting" && reconnectCountdown > 0 && (
          <div className="mt-2 text-center text-blue-500 animate-pulse">Reconnecting in {reconnectCountdown}...</div>
        )}
      </div>
    </div>
  );
} 