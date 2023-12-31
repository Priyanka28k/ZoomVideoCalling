// const { default: Peer } = require("peerjs");

const socket = io("/");

const videoGrid = document.getElementById("video-grid");

const myVideo = document.createElement("video");
myVideo.muted = true;

const peers = {}

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    // screen visible syncing 
    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    // other user connected
    socket.on("user-connected", (userId) => {
      console.log("User Connected " + userId);
      connectToNewUser(userId, stream);
    });

    socket.on("user-disconnected", (userId) => {
        console.log("User Disconnected " + userId);
        if(peers[userId]){
            peers[userId].close();
        }
      });
      
  });

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});
myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

