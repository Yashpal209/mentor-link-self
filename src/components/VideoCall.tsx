import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageSquare,
  Send,
  X
} from "lucide-react";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
}

interface VideoCallProps {
  roomId: string;
  userName: string;
  onLeave: () => void;
}

const VideoCall = ({ roomId, userName, onLeave }: VideoCallProps) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    initializeMedia();
    return () => {
      cleanup();
    };
  }, []);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsConnected(true);
      toast.success("Connected to video call");
    } catch (error) {
      toast.error("Failed to access camera/microphone");
      console.error("Media error:", error);
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const handleLeaveCall = () => {
    cleanup();
    onLeave();
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: userName,
        text: newMessage,
        timestamp: new Date()
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black">
      <div className="h-full flex">
        {/* Video Area */}
        <div className={`flex-1 relative ${showChat ? 'mr-80' : ''}`}>
          {/* Remote Video (Larger) */}
          <div className="h-full flex items-center justify-center bg-gray-900">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <Video className="w-12 h-12" />
                  </div>
                  <p className="text-lg">Waiting for other participant...</p>
                </div>
              </div>
            )}
          </div>

          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute bottom-24 right-6 w-64 h-48 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
            {!isVideoOn && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff className="w-12 h-12 text-white" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-4 bg-gray-900/90 backdrop-blur-sm px-6 py-4 rounded-full">
              <Button
                variant={isVideoOn ? "secondary" : "destructive"}
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={toggleVideo}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>

              <Button
                variant={isAudioOn ? "secondary" : "destructive"}
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={toggleAudio}
              >
                {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>

              <Button
                variant="destructive"
                size="icon"
                className="rounded-full w-14 h-14"
                onClick={handleLeaveCall}
              >
                <PhoneOff className="w-6 h-6" />
              </Button>

              <Button
                variant={showChat ? "default" : "secondary"}
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-white font-semibold">Chat</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChat(false)}
              >
                <X className="w-4 h-4 text-white" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-gray-400 text-center text-sm">No messages yet</p>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-white">
                          {message.sender}
                        </span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 break-words">
                        {message.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-gray-800">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 border-gray-700 text-white"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default VideoCall;
