import express, {Express} from "express"
const app = express()

import dotenv  from "dotenv" 
dotenv.config();

import bodyParser from "body-parser";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

export default app