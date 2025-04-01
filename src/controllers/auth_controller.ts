import  {NextFunction, Request,Response} from "express";
import userModel from "../models/User_model"
import bcrypt from 'bcrypt'
import jwt , {SignOptions} from 'jsonwebtoken'

type Payload = {
    _id:string
}
export class AuthController{
    protected model = userModel;

    constructor() {
        this.register = this.register.bind(this);
      }

    // protected async createUserFromData(data: any) {
    //     try {
    //         console.log("📨 Incoming registration data:", data);
    
    //         const salt = await bcrypt.genSalt(10);
    //         const hashedPassword = await bcrypt.hash(data.password, salt);
    
    //         const existingUsername = await this.model.findOne({ username: data.username });
    //         const existingEmail = await this.model.findOne({ email: data.email });
    
    //         if (existingEmail) throw new Error('Email is already taken');
    //         if (existingUsername) throw new Error('Username is already taken');
    
    //         const user = await this.model.create({
    //             username: data.username,
    //             password: hashedPassword,
    //             email: data.email,
    //             phone: data.phone,
    //             profileImage: data.profileImage || '.../public/photos/avatar.png',
    //             bio: data.bio,
    //             dateOfBirth: data.dateOfBirth,
    //             gender: data.gender,
    //             interests: data.interests,
    //             isPremium: data.isPremium
    //         });
    
    //         console.log("✅ User created:", user._id);
    //         return user;
    //     } catch (err) {
    //         console.error("❌ Error in createUserFromData:", err);
    //         throw err;
    //     }
    // }
    protected async createUserFromData(data: any) {
        const { email, username, password, phone } = data;
      
        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          throw new Error("Invalid email format");
        }
      
        if (!phone || phone.length < 6) {
          throw new Error("Phone number is too short");
        }
      
        if (!password) {
          throw new Error("Password is required");
        }
      
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
      
        const existingUsername = await this.model.findOne({ username });
        const existingEmail = await this.model.findOne({ email });
      
        if (existingEmail) throw new Error("Email is already taken");
        if (existingUsername) throw new Error("Username is already taken");
      
        const user = await this.model.create({
          username,
          password: hashedPassword,
          email,
          phone,
          profileImage: data.profileImage || '.../public/photos/avatar.png',
          bio: data.bio,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          interests: data.interests,
          isPremium: data.isPremium
        });
      
        return user;
      }
      
    
      
    

    protected generateTokens = (_id:string):{accessToken:string,refreshToken:string}| null =>{

        const JWT_SECRET = process.env.TOKEN_SECRET;
        const ACCESS_TOKEN_EXPIRES = process.env.TOKEN_EXPIRES ? process.env.TOKEN_EXPIRES.trim() : "15m";
        const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES ? process.env.REFRESH_TOKEN_EXPIRES.trim() : "7d"; 

        if (!JWT_SECRET) {
            console.error("Missing TOKEN_SECRET in .env file");
            return null;
        }
        const random = Math.floor(Math.random() * 1000000);
        const accessTokenOptions: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRES as SignOptions["expiresIn"] };
        const refreshTokenOptions: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRES as SignOptions["expiresIn"] };
        const accessToken = jwt.sign(
            { _id, random }, 
            JWT_SECRET, 
            accessTokenOptions
        );

        const refreshToken = jwt.sign(
            { _id, random }, 
            JWT_SECRET, 
            refreshTokenOptions
        );

        return { accessToken, refreshToken };
    }

    // public  register = async (req:Request,res:Response)=>{
    //     try{
    //         const salt = await bcrypt.genSalt(10)
    //         const hashedPassword = await bcrypt.hash(req.body.password,salt)
    //         if(!req.body.profileImage){
    //             req.body.profileImage = ".../public/photos/avatar.png"
    //         }
    //         const existingUsername = await userModel.findOne({username:req.body.username})
    //         const existingEmail = await userModel.findOne({email:req.body.email})
    //         if(existingEmail)
    //         {
    //             return res.status(400).send('Email is already taken')
    //         }
    //         if(existingUsername){
    //             return res.status(400).send('Username is already taken')
    //         }
    //         const data = req.body
    //         const user = await userModel.create({
    //             username:data.username,
    //             password:hashedPassword,
    //             email:data.email,
    //             phone:data.phone,
    //             profileImage:data.profileImage,
    //             bio:data.bio,
    //             dateOfBirth:data.dateOfBirth,
    //             gender:data.gender,
    //             interests:data.interests,
    //             isPremium:data.isPremium
    //         })
    //         res.status(201).json(user)
    //     }catch(err){
    //         res.status(500).send('Server error')
    //     }
    // }
    public async register(req: Request, res: Response) {
        try {
          console.log("🚀 Reached register()", req.body); // log request body
          const user = await this.createUserFromData(req.body);
          res.status(201).json(user);
        } catch (err: any) {
          console.error("❌ Error in register():", err);
          res.status(400).send(err.message || 'Server error');
        }
    }
      


    public login = async(req:Request,res:Response)=>{
        try{
            const user = await userModel.findOne({username:req.body.username})
            if(!user){
                res.status(400).send('Bad info')
                return;
            }
            const validPassword = await bcrypt.compare(req.body.password,user.password)
            if(!validPassword){
                res.status(400).send('Bad info')
                return
            } 
            
            const tokens = this.generateTokens(user.id.toString())
            if(!tokens){
                res.status(400).send('couldnt generate tokens')
                return
            }
            if(user.refreshTokens == undefined || user.refreshTokens == null )
            {
                user.refreshTokens = [];
                await user.save()
            }
            user.refreshTokens.push(tokens.refreshToken)
            await user.save()
            res.status(200).send({
                refreshToken:tokens.refreshToken,
                accessToken:tokens.accessToken,
                _id:user._id
            })
        }catch(err){
            res.status(400).send(err)
        }
    }

    public refresh = async(req:Request,res:Response)=>{
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken; 

        if(!refreshToken)
        {
            res.status(400).send("bad token")
            return
        }
        if(!process.env.TOKEN_SECRET)
        {
            res.status(400).send("bad token")
            return
        }

        jwt.verify(refreshToken,process.env.TOKEN_SECRET, async (err:any,data:any)=>{
            if(err){
                res.status(400).send("bad token")
                return
            }
            try{
                const payload = data as Payload
                const user = await userModel.findOne({_id:payload._id})
                if(!user){
                    res.status(400).send("bad token")
                    return
                }
                if(!user.refreshTokens || !user.refreshTokens.includes(refreshToken)|| user.refreshTokens == undefined){
                    user.refreshTokens = undefined
                    await user.save()
                    res.status(400).send("bad token")
                    return
                }
                const newTokens = this.generateTokens(user.id.toString())
                if(!newTokens){
                    user.refreshTokens = undefined
                    await user.save()
                    res.status(400).send("bad token")
                    return
                }
                if(user.refreshTokens == undefined){
                    res.status(400).send("bad token")
                    return
                }
                user.refreshTokens = user.refreshTokens.filter((token)=> token !== refreshToken)
                user.refreshTokens.push(newTokens.refreshToken)
                await user.save()
                res.cookie("refreshToken", newTokens.refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                res.status(200).send({
                    accessToken:newTokens.accessToken,
                    refreshToken:newTokens.refreshToken
                })
            }catch(err){
                res.status(400).send(err)
                return
            }
        })
    }

    public authMiddleware = (req:Request,res:Response,next:NextFunction)=>{
    const authorization = req.header('authorization')
    const token = authorization && authorization.split(' ')[1]
    if(!token)
    {
        res.status(401).send('Access denied')
        return
    }
    if(!process.env.TOKEN_SECRET)
    {
        res.status(500).send('BAD SECRET')
        return
    }
    jwt.verify(token,process.env.TOKEN_SECRET,(err,payload)=>{
        if(err){
            res.status(401).send('Access denied')
            return
        }
        (req as any).user = { _id: (payload as Payload)._id };

        next()
    })
}


    public logout = async(req:Request,res:Response)=>{
        const refreshToken = req.body.refreshToken

        if(!refreshToken)
        {
            res.status(400).send("no token")
            return
        }

        if(!process.env.TOKEN_SECRET)
        {
            res.status(400).send("no token secret")
            return
        }

        jwt.verify(refreshToken,process.env.TOKEN_SECRET,async (err:any,data:any)=>{
            if(err){
                res.status(400).send("no token secret")
                return
            }
            try{
                const payload = data as Payload
                const user = await userModel.findOne({_id:payload._id})
                if(!user){
                    res.status(400).send("no id")
                    return
                }
                if(!user.refreshTokens){
                    user.refreshTokens = undefined
                    await user.save()
                    res.status(400).send("no id")
                    return
                }
                if(!user.refreshTokens.includes(refreshToken))
                {
                    user.refreshTokens = undefined
                    await user.save()
                    res.status(400).send("no id")
                    return
                }
                user.refreshTokens = user.refreshTokens.filter((token)=> token !== refreshToken)
                await user.save()
                res.status(200).send("logged out")
            }catch(err){
                res.status(400).send(err)
                return
            }
        })
    }
}


