import { useCallback, useEffect } from "react";
import { UseSocket } from "../context/SocketProvider"

function RoomPage() {

    const socket = UseSocket();

    const handleUserJoined = useCallback(({email,id})=> {
        console.log(` Email ${email} joined room`)
    },[])
    useEffect(()=>{
        socket.on('user:joined',handleUserJoined)
        return ()=>{
            socket.off("user:joined",handleUserJoined)
        }
    },[socket,handleUserJoined])

  return (
    <h1>RoomPage</h1>
  )
}
export default RoomPage