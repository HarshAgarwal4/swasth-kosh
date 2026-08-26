import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  MonitorUp,
  MessageSquare,
  FileText,
  User,
  Shield,
} from "lucide-react";
import { getSocket } from "../services/socket";
import { createPeerConnection, createOffer, createAnswer, handleAnswer, handleIceCandidate } from "../services/webrtc";
import { useStore } from "../zustand/store";
import axios from "../services/axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";

const VideoCallRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = useStore((state) => state.user);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [callSession, setCallSession] = useState(null);

  // In-Call Chat & Clinical Notes
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [doctorNotes, setDoctorNotes] = useState("");

  const socket = getSocket();

  useEffect(() => {
    let localStream = null;

    const initCall = async () => {
      try {
        // 1. Get User Media
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = localStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        // 2. Initialize PeerConnection
        const pc = createPeerConnection(
          (candidate) => {
            socket.emit("call:ice-candidate", {
              targetSocketId: pcRef.current?.targetSocketId,
              candidate,
            });
          },
          (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
              setRemoteConnected(true);
            }
          }
        );

        // Add local tracks to peer connection
        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
        pcRef.current = pc;

        // 3. Join Socket Room
        socket.emit("call:join-room", {
          roomId,
          role: user?.role || "WORKER",
          userName: user?.name || "Participant",
        });

        // Listen for remote peers joining
        socket.on("call:user-joined", async ({ socketId }) => {
          pcRef.current.targetSocketId = socketId;
          const offer = await createOffer(pcRef.current);
          socket.emit("call:offer", { targetSocketId: socketId, offer });
        });

        socket.on("call:offer", async ({ fromSocketId, offer }) => {
          pcRef.current.targetSocketId = fromSocketId;
          const answer = await createAnswer(pcRef.current, offer);
          socket.emit("call:answer", { targetSocketId: fromSocketId, answer });
          setRemoteConnected(true);
        });

        socket.on("call:answer", async ({ answer }) => {
          await handleAnswer(pcRef.current, answer);
          setRemoteConnected(true);
        });

        socket.on("call:ice-candidate", async ({ candidate }) => {
          if (candidate) {
            await handleIceCandidate(pcRef.current, candidate);
          }
        });

        socket.on("call:ended", () => {
          toast.info("Remote participant has ended the consultation.");
          endCall();
        });
      } catch (err) {
        console.error("WebRTC Init error:", err);
        toast.error("Camera/Microphone permission denied or unavailable: " + err.message);
      }
    };

    initCall();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
      socket.off("call:user-joined");
      socket.off("call:offer");
      socket.off("call:answer");
      socket.off("call:ice-candidate");
      socket.off("call:ended");
    };
  }, [roomId, socket, user]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        socket.emit("call:toggle-audio", { roomId, isMuted: !audioTrack.enabled });
      }
    }
  };

  const toggleCam = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        socket.emit("call:toggle-video", { roomId, isVideoOff: !videoTrack.enabled });
      }
    }
  };

  const endCall = async () => {
    socket.emit("call:end", { roomId });
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
    }
    try {
      await axios.post(`/api/calls/${roomId}/end`, { clinicalSummaryNotes: doctorNotes });
    } catch (e) {}
    toast.info("Telemedicine consultation ended.");
    navigate(user?.role === "DOCTOR" || user?.role === "MEDICAL_OFFICER" ? "/doctor/dashboard" : "/dashboard");
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    const msgObj = {
      senderName: user?.name || "Me",
      text: messageInput,
      sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, msgObj]);
    setMessageInput("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col lg:flex-row gap-4">
        {/* Main Video Stage */}
        <div className="flex-1 flex flex-col justify-between bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative shadow-2xl min-h-[500px]">
          {/* Header Bar */}
          <div className="p-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <span className="font-bold text-sm">Telemedicine Consultation</span>
              <span className="text-xs text-slate-400 font-mono">[{roomId}]</span>
            </div>

            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full font-semibold">
              WebRTC Encrypted P2P
            </span>
          </div>

          {/* Video Grid */}
          <div className="flex-1 relative flex items-center justify-center p-4">
            {/* Remote Doctor / Patient Video */}
            <div className="w-full h-full min-h-[360px] bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${remoteConnected ? "block" : "hidden"}`}
              />
              {!remoteConnected && (
                <div className="text-center p-6 text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-700 mx-auto mb-3 flex items-center justify-center animate-pulse">
                    <User className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-200">Waiting for Remote Participant to Join...</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Doctor and Worker will be connected automatically when present in room.
                  </p>
                </div>
              )}
            </div>

            {/* Local Video Thumbnail (Picture in Picture) */}
            <div className="absolute bottom-6 right-6 w-40 sm:w-52 h-28 sm:h-36 bg-slate-950 rounded-xl overflow-hidden border-2 border-indigo-500 shadow-2xl z-20">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoOff ? "hidden" : "block"}`}
              />
              {isVideoOff && (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-[10px] font-bold text-slate-400">
                  Camera Off
                </div>
              )}
              <div className="absolute bottom-1 left-2 text-[10px] font-semibold bg-slate-900/80 px-1.5 py-0.5 rounded">
                You ({user?.name || "Self"})
              </div>
            </div>
          </div>

          {/* Call Control Strip */}
          <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-center gap-4 z-10">
            <button
              onClick={toggleMic}
              className={`p-3.5 rounded-full transition active:scale-95 ${
                isMuted ? "bg-red-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleCam}
              className={`p-3.5 rounded-full transition active:scale-95 ${
                isVideoOff ? "bg-red-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"
              }`}
              title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full transition"
              title="Toggle In-Call Chat"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            <button
              onClick={endCall}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full flex items-center gap-2 shadow-lg transition active:scale-95"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Consultation</span>
            </button>
          </div>
        </div>

        {/* Sidebar: In-Call Chat & Doctor Clinical Notes */}
        {showChat && (
          <div className="w-full lg:w-80 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-[560px] p-4 shadow-xl">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
              <span>Consultation Notes & Chat</span>
              <span className="text-emerald-400 text-[10px]">Active</span>
            </div>

            {/* Doctor Clinical Notes Box if clinician */}
            {(user?.role === "DOCTOR" || user?.role === "MEDICAL_OFFICER") && (
              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Live Clinical Notes
                </label>
                <textarea
                  rows={3}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Record symptoms observed, advice given..."
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {chatMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-xs text-slate-500">
                  Send messages or prescription notes during the call
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className="bg-slate-800/80 p-2.5 rounded-xl text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <span className="font-bold text-indigo-300">{msg.senderName}</span>
                      <span>{msg.sentAt}</span>
                    </div>
                    <p className="text-slate-200">{msg.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={sendChatMessage} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Type message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default VideoCallRoom;
