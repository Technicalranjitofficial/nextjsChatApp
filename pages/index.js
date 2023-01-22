import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

import Chat from "../Components/Chat"
import { useEffect, useState } from 'react'
import MainTemp from "../Components/MainTemp"
import { io } from 'socket.io-client'

let socket;
export default function Home() {
  const getInitialSate = () => {
    const rvalue = "Fun";
    return rvalue;
  };

  const [page, setpage] = useState(0);
  const [username, setUsername] = useState("");

  const [room, setRoom] = useState(getInitialSate);
  const [usesrList, setUserList] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [mes, setMes] = useState("");
  const [typing, settyping] = useState("");
  const [tyuser, settyuser] = useState("");
  const [file, setFile] = useState();
  const [src,setSrc] = useState("");
  const [imgLoading,setimgLoading] = useState(false);

  const [btnstatus,setBtnStatus] = useState(false);



  const onclick = (e) => {
    e.preventDefault();
    // console.log(username);
    setpage((page) => (page = page + 1));
    const data = {
      username: username,
      room: room,
      id: socket.id,
      time:
        new Date(Date.now()).getHours() +
        ":" +
        new Date(Date.now()).getMinutes(),
      st: "new_user",
      
    };
    socket.emit("join_room", data);
  };

  // const sendMessage=(e)=>{
  //   e.preventDefault();

  // }

  const sendMessage = async (e) => {
    // scroll.scrollTop = scroll.scrollHeight+2000;
    e.preventDefault();
    setimgLoading(true)
    settyping("");

    if(file && message!==""){
      const reader = new FileReader();
      const blob = new Blob([file], { type: file.type });
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
       
        setSrc(reader.result);
       
        const messageData = {
          room: room,
          username: username,
          message: message,
          image: reader.result,
          id: socket.id,
          fileName: file.name,
  
          time:
            new Date(Date.now()).getHours() +
            ":" +
            new Date(Date.now()).getMinutes(),
          st: "message",
          
        };
        setUserList((list)=>list.concat(messageData));
         socket.emit("send_message", messageData);
        setFile();
        setMessage("");
        setBtnStatus(false);
        // e.preventDefault();
      
      };
    }

    else if (!file && message!=="") {
      e.preventDefault();
      const messageData = {
        room: room,
        username: username,
        message: message,
        id: socket.id,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
        st: "message",
        
      };
       socket.emit("send_message", messageData);
      setUserList((list)=>list.concat(messageData));
      setMessage("");
      // e.preventDefault();
    
    
    }else if (message === "" && file) {
      e.preventDefault();
      const reader = new FileReader();
      const blob = new Blob([file], { type: file.type });
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
       
        setSrc(reader.result);
       
        const messageData = {
          room: room,
          username: username,
          image: reader.result,
          id: socket.id,
          fileName: file.name,
  
          time:
            new Date(Date.now()).getHours() +
            ":" +
            new Date(Date.now()).getMinutes(),
          st: "message",
          
        };
         socket.emit("send_message", messageData);
        setUserList((list)=>list.concat(messageData));
        setFile();
        setMessage("");
        setBtnStatus(false)
        // e.preventDefault();
      };
  }
  }

  useEffect(() => {
   initialize();
  }, []);


  const initialize=async()=>{

    await fetch("/api/socket");
    socket = io();
    socket.on("typing_received", (data) => {
      settyping(data.id);
      const tymes = `${data.username} is typing`;
      settyuser(tymes);
    });

    socket.on("receive_message", (data) => {
      // data.e.preventDefault();
      console.log(data);
      // e.preventDefault();
      setUserList((list) => list.concat(data));
      setimgLoading(false)
      // setUserList(data)
    });

    socket.on("roomUsers", ({ users, room }) => {
      const data = {
        users: users,
        room: room,
      };
      console.log({users,room});
      setRoomUsers(data);
    });
    socket.on("new_user", (data, e) => {
      console.log(data);

      setUserList((list) => [...list, data]);
      const a = `${data.message}`;
      setMes(a);
      // e.preventDefault();
    });
  }

  return (
    <>
      <div className="conatiner">
        {page === 0 ? (
          <MainTemp
            onclick={onclick}
            value={username}
            onroomchange={(e) => {
              setRoom(e.target.value);
            }}
            onuserchange={(e) => {
              setUsername(e.target.value);
            }}
            room={room}
          />
        ) : (
          <Chat
            username={username}
            usesrList={usesrList}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              const id = socket.id;
              socket.emit("typing", { username, id, room });

              if (e.nativeEvent.inputType === "insertLineBreak")
                return document.querySelector("#btnsubmit").click();

              setTimeout(() => {
                settyping("");
              }, 5000);
            }}
            tyuser={tyuser}
            settyuser={settyuser}
            setMes={setMes}
            id={socket.id}
            settyping={settyping}
            sendMessage={sendMessage}
            roomUsers={roomUsers}
            mes={mes}
            typing={typing}
            imageOnChange={(e) => {
       
              setFile(e.target.files[0]);
              setBtnStatus(true)
       
            }}

            

            btnstatus={btnstatus}
            setFile={setFile}
            setBtnStatus={setBtnStatus}
            imgLoading={imgLoading}
          />
        )}
      </div>
    </>
  );
}

