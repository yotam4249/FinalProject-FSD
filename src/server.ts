import express, {Express} from "express"
import dotenv  from "dotenv" 
import mongoose from "mongoose";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth_routes"
import postsRoutes from "./routes/posts_routes"
import commentsRoutes from "./routes/comments_routes"
import businessRoutes from "./routes/business_routes"
import promotionRoutes from "./routes/promotion_routes"
const app = express()
dotenv.config();
app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use('/auth',authRoutes)
app.use("/posts",postsRoutes);
app.use("/comments",commentsRoutes);
app.use("/business",businessRoutes)
app.use("/promotions", promotionRoutes);

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