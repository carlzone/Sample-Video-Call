var server = new Ably.Realtime("FdWPMQ.SWN8ug:PggMzYgwya45kdX7");
var channel = server.channels.get("VCallRoom", { params: { rewind: "50" } });

$(document).ready(function() {
  channel.subscribe("roomList", function(msg) {
    var room = msg.data;
    $("#roomList").append(
      '<a href="./vroom.html#' +
        room +
        '" class="btn btn-obj m-3">' +
        room.toUpperCase() +
        "</a>"
    );
  });

  $(document).on("click", "#createRoom", function() {
    var room = "room-" + (Math.random() * 1000).toFixed(0).toString();
    channel.publish("roomList", room);
  });
});
