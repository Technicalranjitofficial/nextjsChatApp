import { Server } from "socket.io";

// const users =[];
// const joinRoom = (id,room,usr)=>{

//     const user = {id,room,usr};
//     users.push(user);
//     return user;
// }

// const getUser = (room)=>{
//     return users.filter((usr)=>usr.room===room);
// }
const users = [];
const group = {};

// Join user to chat
function userJoin(id, username, room) {
  const user = { id, username, room };

  users.push(user);

  return user;
}

// Get current user
// function getCurrentUser(id) {
//   return users.find(user => user.id === id);
// }

// User leaves chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

export default async function SocketHandler(req, res) {
  if (req.socket.server.io) {
    console.log("Socket is already running");
  } else {
    const io = new Server(req.socket.server);
    req.socket.server.io = io;

    // const users={};

    io.on("connection", (socket) => {
      console.log("User is connected : " + socket.id);

      // socket.on("new_user",(username)=>{
      //     // console.log(username)
      //     // users[username]=socket.id;
      //     // console.log(users[username])
      //     io.emit("new_user",users);
      // })

      socket.on("join_room", ({ username, room, time, st }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        const dat = getRoomUsers(room);
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
        //  console.log(user)
        //  console.log(dat)
        const data = {
          username: username,
          room: room,
          id: socket.id,
          message: `${username} has joined the chat`,
          time: time,
          st: st,
        };

        io.to(room).emit("new_user", data);
      });

      socket.on("typing", (data) => {
        io.to(data.room).emit("typing_received", {
          id: data.id,
          username: data.username,
        });
      });

      socket.on("send_message", (data) => {
        io.to(data.room).emit("receive_message", data);
        // console.log(data)
      });

      socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        try {
          const getroom = user.room;
          console.log(user);
          if (user) {
            const data = {
              username: user.username,
              room: getroom,
              id: socket.id,
              message: `${user.username} has left the chat`,
              time:
                new Date(Date.now()).getHours() +
                ":" +
                new Date(Date.now()).getMinutes(),
              st: "new_user",
            };
            io.to(getroom).emit("new_user", data);
          }
          // console.log("user left" +user)
          io.to(getroom).emit("roomUsers", {
            room: getroom,
            users: getRoomUsers(getroom),
          });
          //  console.log(getroom)
        } catch (error) {
          console.log(error);
        }
      });
    });
  }

  res.end();
}
