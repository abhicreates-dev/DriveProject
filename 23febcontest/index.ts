import express from 'express'
import { type Request, type Response, type NextFunction } from "express";
import { userSchema, folderSchema } from './types';
import { prisma } from './db';
import { authMiddleware } from './authMiddleware';
import jwt, { type JwtPayload } from "jsonwebtoken";

const jwtSecret = process.env.SECRET!;


const app = express()

app.use(express.json())

app.post("/signup", async (req: Request, res: Response) => {
    const validation = userSchema.safeParse(req.body)

    if (!validation.success) {
        return res.status(400).json({
            message: "kuch toh gadbad hai"
        })
    }

    const { email, password, name } = validation.data

    const User = await prisma.user.create({
        data: {
            name,
            email,
            password
        }
    })

    return res.status(200).json({
        message: "user registered succesfully",
        data: User
    })
})


app.post("/signin", async (req: Request, res: Response) => {
    const validation = userSchema.safeParse(req.body)

    if (!validation.success) {
        return res.status(400).json({
            message: "kuch toh gadbad hai"
        })
    }

    const { email, password, name } = validation.data

    const userFind = await prisma.user.findUnique({
        where: { email }
    })

    if (!userFind) {
        return res.status(400).json({
            message: "kuch toh gadbad hai user nahi mil raha"
        })
    }

    if (userFind.password != password) {
        return res.status(400).json({
            message: "kuch toh gadbad hai password nahi mil raha"
        })
    }

    const token = jwt.sign(
        { userId: userFind.id },
        jwtSecret,
    );

    return res.status(200).json({
        message: "mubarrak",
        signed: token
    })
})

app.post("/createFolder", authMiddleware, async (req: Request, res: Response) => {
    const validation = folderSchema.safeParse(req.body)

    if (!validation.success) {
        return res.status(400).json({
            message: "kuch toh gadbad hai"
        })
    }

    const { title, parentId } = validation.data

    const folder = await prisma.folder.create({
        data: {
            title: title,
            parentId: parentId ?? null,
            userId: req.user!.userId
        }
    })

    res.status(200).json({
        message: "folder created succesfully",
        data: folder
    })
})



app.get("/folders{/:parentId}", authMiddleware, async (req: Request, res: Response) => {

    const parentId = req.params.parentId as string | null;

    if (parentId == null) {
        const folders = await prisma.folder.findMany({
            where: {
                userId: req.user!.userId,
                parentId: null
            }
        })
        return res.status(200).json({
            message: "folders fetched succesfully",
            data: folders
        })
    } else {
        const folders = await prisma.folder.findMany({
            where: {
                userId: req.user!.userId,
                parentId: parentId
            }
        })
        return res.status(200).json({
            message: "folders fetched succesfully",
            data: folders
        })
    }

})

app.listen(3000)