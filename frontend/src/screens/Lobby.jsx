import React, { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { UseSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

const LobbyScreen = ()=>{

    const [email,setEmail] = useState("");
    const [room, setRoom] = useState("");

    const socket = UseSocket()
    const navigate = useNavigate();

    const handleSubmit = useCallback((e)=>{
        e.preventDefault();
        socket.emit("room:join",{email,room})
    },[email,room,socket])

    const handleJoinRoom = useCallback((data)=>{
        const {email,room} = data; 

        navigate(`/room/${room}`)
    })
    useEffect(()=>{
        socket.on("room:join", handleJoinRoom)
        return ()=>{
            socket.off("room:join", handleJoinRoom)
        }
    },[navigate])

    return (
        <div>

        <div>Lobby</div>
        <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email ID</label>
            <input type="" id="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <br />
            <label htmlFor="room">Room Number</label>
            <input type="" id="room" value={room} onChange={(e)=>setRoom(e.target.value)} />
            <br />
            <button>Join</button>
        </form>
        </div>
    )
}

export default LobbyScreen;