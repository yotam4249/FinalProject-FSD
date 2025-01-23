import initApp from './server'
import app from './server'

const port = process.env.PORT

initApp().then((app)=>{
    app.listen(port,()=>{
        console.log(`server is on port ${port}`)
        console.log("http")
    });
})
// app.listen(port,()=>{
//     console.log("server is on port 3000")
// })