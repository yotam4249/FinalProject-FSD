import initApp from './server'
import app from './server'

const port = process.env.PORT

initApp().then((app)=>{
    app.listen(port,()=>{
        console.log(`server is on port ${port}`)
        console.log(`app listening at http://localhost:${port}`);
    });
})
// app.listen(port,()=>{
//     console.log("server is on port 3000")
// })