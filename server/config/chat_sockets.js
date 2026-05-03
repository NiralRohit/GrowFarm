const Notification = require('../models/Notification')
const expert_message = require('../models/expert_message');

async function getnotifications(room){
    let msg = Notification.find({to : room});
    return msg;
  }

async function getroommessages(room)
{
    let msg = await expert_message.find({roomid : room});
    // console.log(msg)
    return msg;
} 

module.exports.chatSockets = function(socketServer){
    const io = require('socket.io')(socketServer, {
        cors: {
          origin: 'http://localhost:3005',
          methods: ['GET', 'POST']
        }
      })

    io.on('connection', function(socket){
        console.log('new connection received', socket.id);
    
        socket.on('disconnect', function(){
            console.log('socket disconnected!');
        });
    
        socket.on('join-notificationroom',async function(data)
        {
            // console.log(data);
            socket.join(data.to);
            let roomMessages = await getnotifications(data.to);
            // socket.to(data.to).emit('get-notification',roomMessages);
            // console.log(roomMessages);
            socket.emit('get-notification', roomMessages)
            console.log("join has been completed")
        })
    
        socket.on('send-notification', async function(data){
            // console.log(data);
            const newMessage = await Notification.create({content : data.content ,to: data.to});
            let roomMessages = await getnotifications(data.to);
            console.log(roomMessages);
            io.to(data.to).emit('get-notification',roomMessages);
        })

        socket.on('join-in-expertroom',async function(data)
        {
          let roomid = data.Farmer + data.expert_email
          
          console.log(roomid)
          socket.join(roomid);
          // socket.leave()
          let messages = await getroommessages(roomid);
          console.log(messages);
          socket.emit("get-roommessages",messages);
          console.log("Join in Experts room");
        });

        
        socket.on('send-message-in-expertroom',async function(data)
        {
          const newMessage = await expert_message.create({content : data.content ,roomid : data.roomid ,to : data.to , From : data.From , expert_email: data.expert, Farmer_number : data.Farmer_number})
          // console.log(newMessage);
          let messages = await getroommessages(data.roomid);
          console.log(messages.length);
          console.log("Send message in expertroom");
          io.to(data.roomid).emit('get-roommessages',messages);
        })


    });

}