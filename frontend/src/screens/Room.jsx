import { useCallback, useEffect, useState } from "react";
import { UseSocket } from "../context/SocketProvider"
import ReactPlayer from "react-player"
function RoomPage() {

    const socket = UseSocket();
    const [remoteSocketID, setRemoteSocketId] = useState(null)
    const [mystream, setMyStream] = useState(null)
    const [videoUrl, setVideoUrl] = useState(null);


    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(` Email ${email} joined room`)
        setRemoteSocketId(id)
    }, [])
    useEffect(() => {
        socket.on('user:joined', handleUserJoined)
        return () => {
            socket.off("user:joined", handleUserJoined)
        }
    }, [socket, handleUserJoined])

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        setMyStream(stream)
        const url = URL.createObjectURL(stream);
        setVideoUrl(url);

        console.log(stream)
    }, [])

    return (
        <>
            <h1>RoomPage</h1>
            <h4>{
                remoteSocketID ? "Connected" : "No one in the room"
            }</h4>
            {
                remoteSocketID &&
                <button onClick={handleCallUser}>CALL</button>
            }
            <video
                autoPlay
                
                
                width="320px"
                height="320"
                controls
                ref={(video) => {
                    if (video && mystream) video.srcObject = mystream;
                }}
            />


        </>
    )
}
export default RoomPage