// Importing 
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
// const Pusher = require('pusher');
import Pusher from 'pusher'
import Cors from 'cors'


// App Config
const app = express()
const port = process.env.port || 9000


const pusher = new Pusher({
  appId: '1076194',
  key: '########',
  secret: '#############',
  cluster: 'ap2',
  encrypted: true
});

const db = mongoose.connection

db.once('open',()=>{
    console.log('DB iS Connected')

    const msgCollection = db.collection('messagecontents')
    const changeStream = msgCollection.watch()

    changeStream.on('change',(change)=>{
        console.log(change)

        if (change.operationType=='insert'){
            const messageDetails =change.fullDocument;
            pusher.trigger('messages','inserted',{
                name:messageDetails.name,
                message : messageDetails.message,
                timestamp : messageDetails.timestamp,
                received : messageDetails.received
            })
        }else{
            console.log('Error Trigger Pusher')
        }

    })

})



// MiddelWare
app.use(express.json())
app.use(Cors())

// app.use((req,res,next)=>{
//     res.setHeader("Access-Control-Allow-Origin",'*')
//     res.setHeader("Access-Control-Allow-Headers",'*')
//     next()
// })


// DB Config 
const connection_url = 'mongodb+srv://Admin:wKbHb1iW5NX5vg2a@cluster0.nr4fy.mongodb.net/CHATAPP-MERNdb?retryWrites=true&w=majority'

mongoose.connect(connection_url,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true,
})

// API routes 
app.get('/',(req,res)=>res.status(200).send('hello world'))

app.get('/message/sync',(req,res)=>{
    Messages.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})




// // API For Sending Messages 
app.post("/message/new",(req,res)=>{
    const dbMessage = req.body

    Messages.create(dbMessage,(err,data)=>{
        if (err){
            res.status(500).send(err)
        }else{
            res.status(201).send(`new message created :\n ${data}`)
        }
    })
})



// Listen
app.listen(port,()=>console.log(`Listen On Local Host : ${port}`))

