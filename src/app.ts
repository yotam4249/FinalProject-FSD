import app from './server'

const port = process.env.PORT

app.listen(port,()=>{
    console.log("server is on port 3000")
})