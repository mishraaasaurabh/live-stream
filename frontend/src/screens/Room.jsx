import { useCallback, useEffect, useState } from "react";
import { UseSocket } from "../context/SocketProvider";
import peer from "../service/peer";

function RoomPage() {
  const socket = UseSocket();
  const [remoteSocketID, setRemoteSocketId] = useState(null);
  const [mystream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // When a user joins
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  // Incoming call (receiver side)
  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      console.log(`Incoming call from ${from}`);
      setRemoteSocketId(from);

      // Get local stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setMyStream(stream);

      // Get answer
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  // ✅ Manual Send Stream button
  const sendStreams = useCallback(async () => {
    if (!mystream) return;

    // Prevent duplicate tracks
    const senders = peer.peer.getSenders();
    for (const track of mystream.getTracks()) {
      const alreadyAdded = senders.find((s) => s.track === track);
      if (!alreadyAdded) peer.peer.addTrack(track, mystream);
    }

    // Manual negotiation
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketID });
  }, [mystream, remoteSocketID, socket]);

  // When call accepted (caller side)
  const handleCallAccepted = useCallback(
    async ({ from, ans }) => {
      await peer.setRemoteDescription(ans);
      console.log("Call accepted from", from);
      // ❌ No sendStreams() here
    },
    []
  );

  // Negotiation handlers
  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setRemoteDescription(ans);
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
  ]);

  // Remote track listener
  useEffect(() => {
    peer.peer.addEventListener("track", (ev) => {
      console.log("GOT TRACKS!!");
      setRemoteStream(ev.streams[0]);
    });
  }, []);

  // Caller initiates the call
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    setMyStream(stream);

    // ❌ Don't add tracks yet
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketID, offer });
  }, [remoteSocketID, socket]);

  return (
    <>
      <h1>RoomPage</h1>
      <h4>{remoteSocketID ? "Connected" : "No one in the room"}</h4>

      {remoteSocketID && <button onClick={handleCallUser}>CALL</button>}
      {mystream && <button onClick={sendStreams}>Send Stream</button>}

      {mystream && (
        <>
          <h1>My Stream</h1>
          <video
            autoPlay
            playsInline
            muted
            width="320px"
            height="320px"
            ref={(video) => video && (video.srcObject = mystream)}
          />
        </>
      )}

      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <video
            autoPlay
            playsInline
            width="320px"
            height="320px"
            ref={(video) => video && (video.srcObject = remoteStream)}
          />
        </>
      )}
    </>
  );
}

export default RoomPage;
