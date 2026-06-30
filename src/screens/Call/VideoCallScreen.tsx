import React, { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  mediaDevices,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
} from "react-native-webrtc";
import InCallManager from "react-native-incall-manager";

import { styles } from "./Video.CallScreen.styles";
import { CallControls } from "./CallControls";
import { RemoteVideoView, LocalVideoView } from "./VideoView";
import { configuration, setMediaBitrate } from "./config";
import { useSocket } from "@/lib/context/socket-context";

export default function VideoCallScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();

  // 1. Consume the global socket from your context. NO MORE io() IMPORTS!
  const { socket } = useSocket();

  // 2. Dynamic Room Generation: Grab the specific chat/match ID from navigation params
  const ROOM_ID = route.params?.conversationId || route.params?.matchId;

  // Streams and UI states
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [status, setStatus] = useState("Initializing...");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  // References
  const pcRef = useRef<any>(null);
  const localStreamRef = useRef<any>(null);
  const remoteSocketId = useRef<string | null>(null);

  const isRemoteDescriptionSet = useRef(false);
  const iceQueue = useRef<any[]>([]);
  const pendingOffers = useRef<any[]>([]);
  const isInitiator = useRef(false);
  const isReady = useRef(false);

  useEffect(() => {
    InCallManager.start({ media: "video" });
    InCallManager.setForceSpeakerphoneOn(true);
    InCallManager.setKeepScreenOn(true);

    return () => {
      // Clean up everything and release audio hardware focus
      InCallManager.setKeepScreenOn(false);
      InCallManager.stop();
    };
  }, []);


  
  useEffect(() => {
    if (!socket || !ROOM_ID) {
      setStatus("Waiting for connection network...");
      return;
    }

    console.log("[WebRTC-App] Mount: Initializing hardware components...");
    init();

    return () => {
      console.log(
        "[WebRTC-App] Unmount: Cleaning up tracks and isolating connection.",
      );
      cleanup();
    };
  }, [socket, ROOM_ID]);

  const init = async () => {
    try {
      setStatus("Accessing media...");

      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 480,
          height: 640,
          frameRate: 15,
          facingMode: "user",
        },
      });

      setLocalStream(stream);
      localStreamRef.current = stream;
      isReady.current = true;

      // 3. Pass execution to listener setup using the global socket
      setupSocketListeners();
    } catch (err: any) {
      console.error("[WebRTC-App] Critical Initialization Error:", err.message);
      setStatus(`Media Error: ${err.message}`);
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;

    setStatus("Connecting to secure room...");
    socket.emit("join_call_room", ROOM_ID);

    socket.on(
      "call_response_received",
      (data: { conversationId: string; accepted: boolean }) => {
        if (
          data.conversationId?.toString() === ROOM_ID?.toString() &&
          !data.accepted
        ) {
          setStatus("Call declined by peer...");
          setTimeout(() => {
            cleanup(); // Automatically closes tracks and goes back to chat screen
          }, 2000);
        }
      },
    );

    socket.on("all_room_users", async (peers: string[]) => {
      // If peers.length === 0, User A is first!
      // They will automatically fall into this else block and show your "Waiting..." layout safely.
      isInitiator.current = peers.length > 0;
      if (!isReady.current) return;

      if (isInitiator.current) {
        remoteSocketId.current = peers[0];
        await createPeer(peers[0], true);
      } else {
        setStatus("Calling peer...");
      }
    });

    socket.on("peer_joined_room", async (id: string) => {
      if (!isReady.current) return;
      if (!pcRef.current) {
        remoteSocketId.current = id;
        await createPeer(id, false);
      }
    });

    socket.on("offer", async ({ from, offer }: any) => {
      remoteSocketId.current = from;

      if (!isReady.current) {
        pendingOffers.current.push({ from, offer });
        return;
      }

      if (!pcRef.current) {
        await createPeer(from, false);
      }

      try {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(offer),
        );
        isRemoteDescriptionSet.current = true;

        const answer = await pcRef.current.createAnswer();
        const optimizedSdp = setMediaBitrate(answer.sdp, 250);
        const optimizedAnswer = { type: answer.type, sdp: optimizedSdp };

        await pcRef.current.setLocalDescription(optimizedAnswer);
        socket.emit("answer", { to: from, answer: optimizedAnswer });
        await flushIceQueue();
      } catch (err) {
        console.error("SDP offer processing failed:", err);
      }
    });

    socket.on("answer", async ({ answer }: any) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        );
        isRemoteDescriptionSet.current = true;
        await flushIceQueue();
      } catch (err) {
        console.error("SDP answer processing failed:", err);
      }
    });

    socket.on("candidate", async ({ candidate }: any) => {
      if (!pcRef.current || !isRemoteDescriptionSet.current) {
        iceQueue.current.push(candidate);
        return;
      }
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Candidate addition failed:", e);
      }
    });

    socket.on("peer_disconnected_from_call", (id: string) => {
      if (remoteSocketId.current === id) {
        setStatus("Call ended by peer...");
        setTimeout(() => {
          cleanup();
        }, 1500);
      }
    });
  };

  const createPeer = async (peerId: string, initiator: boolean) => {
    const stream = localStreamRef.current;
    if (!stream || !isReady.current || !socket) return;

    setStatus("Establishing link...");
    const pc = new RTCPeerConnection(configuration) as any;
    pcRef.current = pc;

    stream.getTracks().forEach((track: any) => {
      pc.addTrack(track, stream);
    });

    pc.onicecandidate = (event: any) => {
      if (event.candidate && remoteSocketId.current) {
        socket.emit("candidate", {
          to: remoteSocketId.current,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event: any) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        setRemoteStream((prev: any) => {
          if (prev) {
            prev.addTrack(event.track);
            return prev;
          }
          const newStream = new MediaStream();
          newStream.addTrack(event.track);
          return newStream;
        });
      }
    };

    pc.onaddstream = (event: any) => {
      if (event.stream) setRemoteStream(event.stream);
    };

    pc.oniceconnectionstatechange = () => {
      if (
        pc.iceConnectionState === "connected" ||
        pc.iceConnectionState === "completed"
      ) {
        setStatus("Secure connection established");
      }
    };

    if (initiator) {
      try {
        const offer = await pc.createOffer();
        const optimizedSdp = setMediaBitrate(offer.sdp, 250);
        const optimizedOffer = { type: offer.type, sdp: optimizedSdp };

        await pc.setLocalDescription(optimizedOffer);
        socket.emit("offer", { to: peerId, offer: optimizedOffer });
      } catch (err) {
        console.error("Offer creation failed:", err);
      }
    }
  };

  const flushIceQueue = async () => {
    if (!pcRef.current || !isRemoteDescriptionSet.current) return;
    while (iceQueue.current.length > 0) {
      const candidate = iceQueue.current.shift();
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Ice candidate flush failed:", e);
      }
    }
  };

  const toggleMute = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleCamera = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOff(!videoTrack.enabled);
    }
  };

  const cleanup = () => {
    isReady.current = false;
    isRemoteDescriptionSet.current = false;

    // Remove strictly ONLY the WebRTC event listeners to protect the global chat socket
    if (socket) {
      socket.emit("leave_call_room", ROOM_ID);
      socket.off("all_room_users");
      socket.off("peer_joined_room");
      socket.off("offer");
      socket.off("answer");
      socket.off("candidate");
      socket.off("peer_disconnected_from_call");
      socket.off("call_response_received");
    }

    pcRef.current?.close();
    pcRef.current = null;

    localStreamRef.current?.getTracks()?.forEach((track: any) => {
      track.stop();
    });
    localStreamRef.current = null;

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  if (!localStream) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>{status}</Text>
      </View>
    );
  }

  const isConnected = status === "Secure connection established";

  return (
    <View style={styles.container}>
      <RemoteVideoView stream={remoteStream} status={status} roomId={ROOM_ID} />

      <View style={styles.floatingHeaderPill}>
        <View
          style={[
            styles.statusPulseDot,
            { backgroundColor: isConnected ? "#10B981" : "#F59E0B" },
          ]}
        />
        <Text style={styles.headerStatusText}>
          {isConnected ? "Connected Live" : "Securing Link..."}
        </Text>
      </View>

      <LocalVideoView stream={localStream} isCameraOff={isCameraOff} />

      <CallControls
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onEndCall={cleanup}
      />
    </View>
  );
}
