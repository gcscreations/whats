const express = require('express');
const app = express();
const port=5000;
const { Client,LocalAuth,MessageMedia } = require('whatsapp-web.js');

const bodyParser = require('body-parser');

const http = require('http');
const server = http.createServer(app);
app.get('/Hello', (req, res) => {
    res.send('<h1>Hello world</h1>');
});
app.get('/sendMessage', async (req, res) => {
    const id = req.query.id;
    const number = req.query.number;
    const message = req.query.message;
    const mediaPath = req.query.mediaPath;
    console.log(id,number)
    //selva(to,message)
    //const { id, number, message,mediaPath } = data;
    const client = allsessionsObject[id];

    let mediaOptions = {};
    if (mediaPath) {
        const mediaFile = await MessageMedia.fromUrl(mediaPath)
        mediaOptions = {
            caption: 'This is a media caption',
            media: mediaFile
        };
    }
    const chats = await client.getChats();
    //console.log('chats',chats);
    //console.log('data',data);
    /*const messages = await Promise.all(number.map(async number => {

        const msg = await client.sendMessage(`${number}@c.us`, message, mediaOptions);
    }))
        socket.emit('sendMessageSuccess', { message: 'Message sent successfully',msg:messages });

*/
    const msg = await client.sendMessage(`${number}@c.us`, message, mediaOptions);
    res.send("msg sent");
    //socket.emit('sendMessageSuccess', { message: 'Message sent successfully',msg:msg });



    // SendWaMessage(id, socket, numbers, message, mediaPath)
    //   .then(() => {
    //     const successMessage = "message sent successfully";
    //     socket.emit('sessionCreated', { message: successMessage });
    //   })
    //   .catch((error) => {
    //     const errorMessage = "Failed to send message";
    //     socket.emit('mesage sent failed', { message: errorMessage });
    //   });


});
const { Server } = require("socket.io");
const io = new Server(server,{
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    },
})
app.use(bodyParser.json());

// Cors
app.use((req, res, next) => {
    res.header("Access-Control-Allow-credentials", "true");
    res.header("Acces-Control-Allow-Origin", "*");
    res.header(
        "Acces-Control-Allow-Header",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token"
    );
    res.header('Acces-Control-Allow-Methods', "GET,OPTIONS, POST, DELETE, PUT, PATCH");

    //next();
})

// app.get('/', (req, res) => {
//   res.send('<h1>Hello world</h1>');
// });

server.listen(5000, () => {
  console.log('listening on *:5000');
});
/*app.listen(port, () => {
    console.log("listening port " + port + "\nurl: http://localhost:" + port);
});*/

const allsessionsObject = {};

/* const client = new Client({
    puppeteer:{
        headless:false,
    },
    authStrategy: new LocalAuth(
        {
            clientId:"Sankari"
        }
    ),
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
}); */
const createWhatsappSession = async (id,socket) => {
    let client = new Client({
        puppeteer:{
            headless:true,
        },
        authStrategy: new LocalAuth(
            {
                clientId:id
            }
        ),
    });
    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        console.log('QR RECEIVED', {qr});
        socket.emit('qr',{qr});
    });
    client.on('authenticated', (session) => {
        console.log('AUTHENTICATED', session);
        // store.saveSession(session);
        /* sessionCfg = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
            console.error(err);
        }
    }); */
    })
    client.on('ready', () => {
        console.log('READY');
        allsessionsObject[id] = client;
        socket.emit('ready',{id,message:'client is ready'});
    });
   /*  client.on('remote_session_saved',()=>{
        console.log('remote-session saved');
        socket.emit('remote_session_saved',{
            message:'remote session saved'
        });
    }) */


    client.initialize();
}
/*const getWhatsappSession = async (id,socket) => {
    const client = new Client({
        puppeteer: {
            headless: true,
        },
        authStrategy: new RemoteAuth({
            clientId: id,
            store: store,
            backupSyncIntervalMs: 300000
        })
    });
    client.on('ready', () => {
        console.log('wa-client is READY');
    })
    socket.emit('ready',{
        id,
        message:'client is ready'
    });
    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        console.log('QR RECEIVED', {qr});
        socket.emit('qr',{qr,message:'QR RECEIVED when logged out'});
    });
    client.initialize();
};*/
io.on('connection', (socket) => {
    console.log('a user connected',socket?.id);
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    socket.on("connected",(data)=>
  {
    console.log("Connnected to the server",data)
    socket.emit("Hello From the server");
  });
  socket.on('createSession', (data) => {
    console.log('creating session for a user', data);
    const { id } = data;
    createWhatsappSession(id, socket)
      .then(() => {
        const successMessage = "Session created successfully";
        socket.emit('sessionCreated', { message: successMessage });
      })
      .catch((error) => {
        const errorMessage = "Failed to create session";
        socket.emit('sessionCreationFailed', { message: errorMessage });
      });
  });


socket.on('getAllChats',async (data)=>{
    console.log('getting all chats',data);
    const {id} = data;
    const client = allsessionsObject[id];
    const chats = await client.getChats();
    socket.emit('allChats',{chats});
})

socket.on('sendMessage', async (data) => {
    console.log('sending message', data);
    const { id, number, message,mediaPath } = data;
    const client = allsessionsObject[id];

    let mediaOptions = {};
    if (mediaPath) {
        const mediaFile = await MessageMedia.fromUrl(mediaPath)
        mediaOptions = {
            caption: 'This is a media caption',
            media: mediaFile
        };
    }
    const chats = await client.getChats();
    console.log('chats',chats);
    console.log('data',data);
    /*const messages = await Promise.all(number.map(async number => {

        const msg = await client.sendMessage(`${number}@c.us`, message, mediaOptions);
    }))
        socket.emit('sendMessageSuccess', { message: 'Message sent successfully',msg:messages });

*/
    const msg = await client.sendMessage(`${number}@c.us`, message, mediaOptions);
    socket.emit('sendMessageSuccess', { message: 'Message sent successfully',msg:msg });



    // SendWaMessage(id, socket, numbers, message, mediaPath)
    //   .then(() => {
    //     const successMessage = "message sent successfully";
    //     socket.emit('sessionCreated', { message: successMessage });
    //   })
    //   .catch((error) => {
    //     const errorMessage = "Failed to send message";
    //     socket.emit('mesage sent failed', { message: errorMessage });
    //   });
  });
    function selva(id,number)
    {
        console.log("Message Called Function:"+id,name);
    }
  });

//client.initialize();

