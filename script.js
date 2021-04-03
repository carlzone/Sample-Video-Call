//Signal Server
var server = new Ably.Realtime("FdWPMQ.SWN8ug:PggMzYgwya45kdX7");
var channel = server.channels.get("VCallRoom");

//ID
const user = "user-" + (Math.random() * 1000).toFixed(0).toString();
var receiver;

//Server Connected
server.connection.on("connected", function() {
  console.log("Server Connected\n");
  $("#roomList").val("Server Connected\n");
  room = location.hash;

  if (room != "") {
    //Connect to new guest
    channel.subscribe(room + "-block", function(msg) {
      if (msg.data != user) {
        console.log("Connecting to Guest");
        connectToGuest(msg.data);
        $("#connectRoom").attr("disabled", false);
        console.log("FROM: ", msg.data);
      }
    });

    //User Signal Connection
    channel.subscribe("signal-" + user, function(msg) {
      if (peerCon) {
        console.log("Receiver Signal signal-", user);
        peerCon.signal(msg.data.signal);
      }
    });

    //Received Video Stream from Host
    channel.subscribe(user + "-Channel", function(msg) {
      console.log("Host: ", msg.data);
      receiver = msg.data;

      peerConnection(false, localStream);
      $("#roomName").val(msg.data);

      $("#connectRoom").attr("disabled", true);
      $("#roomName").attr("disabled", true);
    });

    //Apply for a connection
    channel.publish(room + "-block", user);
    console.log("My ID: ", user);
  }
});

//Video Constraints
var hasCamera = false;
var hasMic = false;

navigator.mediaDevices.enumerateDevices().then(function(devices) {
  devices.forEach(device => {
    if (device.kind == "audioinput") {
      hasMic = true;
    }
    if (device.kind == "videoinput") {
      hasCamera = true;
    }
  });
});
const constraints = {
  video: {
    aspectRatio: 1.3333333
  },
  audio: true
};
var localStream;
navigator.mediaDevices
  .getUserMedia(constraints)
  .then(getStream)
  .catch(error => {
    console.log("Media ERROR", error);
  });
async function getStream(stream) {
  localStream = await stream;
  const localVideo = document.querySelector("video#localVideo");
  localVideo.srcObject = localStream;
}

//Peer Connection
var peerCon;
//Channel of Room
var room;

//Streaming
var isStreaming = false;

//Host Event
function connectToGuest(receiver) {
  console.log("Connecting Receiver: ", receiver);
  console.log("Connecting User: ", user);
  peerConnection(true, localStream);
  channel.publish(receiver + "-Channel", user);

  $("#connectRoom").attr("disabled", true);
  $("#roomName").attr("disabled", true);
}
// $(document).on("click", "#connectRoom", function() {
//   receiver = $("#roomName").val();

//   peerConnection(true, localStream);
//   channel.publish(receiver + "-Channel", user);

//   $("#connectRoom").attr("disabled", true);
//   $("#roomName").attr("disabled", true);
// });

//Create Simple Peer Connection
function peerConnection(isHost, stream) {
  var configuration = {
    initiator: isHost,
    stream: stream,
    iceServers: [
      {
        urls: "stun:stun1.l.google.com:19302"
      }
    ]
  };

  peerCon = new SimplePeer(configuration);

  peerCon.on("signal", sendSignal.bind(this));
  peerCon.on("error", error.bind(this));
  peerCon.on("connect", connect.bind(this));
  peerCon.on("close", close.bind(this));
  peerCon.on("stream", receiveStream.bind(this));
}

//Sending signal to the guest
function sendSignal(signal) {
  channel.publish("signal-" + receiver, {
    user: user,
    signal: signal
  });
}

//Recieving Stream from the guest
function receiveStream(stream) {
  const video = document.querySelector("#guestVideo");
  video.srcObject = stream;
}

//On peer connected
function connect() {
  $(".vholder").addClass("twoView");
  $("#localVideo").addClass("twoView");
  $(".vholder-guest").removeClass("hideVGuest");
}

//On peer closed
function close() {
  $("#roonList").val($("#roonList").val() + "Peer Connection Closed\n");
  peerCon.destroy();

  $(".vholder").removeClass("twoView");
  $("#localVideo").removeClass("twoView");
  $(".vholder-guest").addClass("hideVGuest");

  $("#connectRoom").attr("disabled", false);
  $("#roomName").val("");
}

//Where error is incounter
function error(error) {
  $("#roonList").val($("#roonList").val() + "Peer Connectiont Error\n");
  console.log("Peer Connection Error: ", error);
}
