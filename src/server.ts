import express, {Express} from "express"
const app = express()
import dotenv  from "dotenv" 
dotenv.config();
import mongoose from "mongoose";
import bodyParser from "body-parser";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

const initApp = ()=>{
    return new Promise<Express>((resolve,reject)=>{
    
        const db=mongoose.connection
        db.on('error',error=>{console.error(error)})
        db.once('open',()=>console.log('connected to mongo'))
    
        if(process.env.DATABASE_URL === undefined)
        {
            console.error("DATABASE_URL isn't set")
            reject()
        }
        else{
            mongoose.connect(process.env.DATABASE_URL).then(()=>{
                resolve(app)
            })
        }
        
        })
    }

export default initApp