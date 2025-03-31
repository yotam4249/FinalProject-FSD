import {Express} from "express"
import mongoose from "mongoose"
import request from "supertest"
import initApp from"../server"
import userModel , {IUser} from "../models/User_model"
import * as authController from "../controllers/auth_controller"
import jwt from "jsonwebtoken"

let app:Express;


beforeAll(async ()=>{
    app = await initApp()
    await userModel.deleteMany()
})

afterAll(async ()=>{
    await mongoose.connection.close()
    
})


type User= Partial<IUser> & {
    accessToken?:string
    refreshToken?:string
}
let originalTokenSecret: string;
const baseUrl = "/auth"

const testUser:User = {
    username:"testusername",
    email:"test@user.com",
    password:"testpassword",
}

describe('User tests',()=>{
    beforeEach(() => {
        // Save the original TOKEN_SECRET
        originalTokenSecret = process.env.TOKEN_SECRET as string;
      });
      afterEach(() => {
        // Restore the original TOKEN_SECRET
        process.env.TOKEN_SECRET = originalTokenSecret;
      });
      test("Auth test register", async ()=>{
        const response = await request(app).post(baseUrl+"/register").send(testUser)
        expect(response.statusCode).toBe(201)
        expect(response.body.email).toBe(testUser.email);
        
    })
    test("Auth test register", async ()=>{
        const response = await request(app).post(baseUrl+"/register").send({
            email:"jkashlfk"
        })
        expect(response.statusCode).not.toBe(200)
    })
    test("Auth test register", async ()=>{
        const response = await request(app).post(baseUrl+"/register").send(testUser)
        expect(response.statusCode).not.toBe(200)
    })
    test("Auth test login", async ()=>{
        const response = await request(app).post(baseUrl+"/login").send(testUser)
        expect(response.statusCode).toBe(200)
        const accessToken = response.body.accessToken
        const refreshToken = response.body.refreshToken
        expect(accessToken).toBeDefined()
        expect(refreshToken).toBeDefined()
        expect(response.body._id).toBeDefined()
        testUser.accessToken = accessToken
        testUser.refreshToken = refreshToken
        testUser._id = response.body._id
    })
    test("Auth test login bad info", async ()=>{
        const response = await request(app).post(baseUrl+"/login").send({
            email:"",
            password:""
        })
        expect(response.statusCode).not.toBe(200)
    })

    test("Auth test login bad info pass", async ()=>{
        const response = await request(app).post(baseUrl+"/login").send({
            email:"test@user.com",
            password:"123456",
        
        })
        expect(response.statusCode).not.toBe(200)
    })
})