import express from 'express'
import { type Request, type Response, type NextFunction } from "express";
import { userSchema, folderSchema, fileSchema } from './types';
import { prisma } from './db';
import { authMiddleware } from './authMiddleware';
import jwt, { type JwtPayload } from "jsonwebtoken";
import cors from "cors"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { error } from 'node:console';

const jwtSecret = process.env.SECRET!;


const app = express()

app.use(express.json())
app.use(cors())

let ACCESS_KEY_ID = "4394e09bb5f78c5a179bfad4bf3f6664";
let ACCESS_KEY_SECRET = "0b50d16dbd086fe47cd2f17d5edf15b8a73ead0b7003e847780612cd91293f72"
let ACCESS_URL = "https://e21220f4758c0870ba9c388712d42ef2.r2.cloudflarestorage.com"

let BUCKET_NAME = "youtube-100xdevs"

const s3Client = new S3Client({
    region: "auto",
    endpoint: ACCESS_URL,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: ACCESS_KEY_SECRET,
    },
});


function getFileExtension(fileName: string) {
    const parts = fileName.split(".");
    const extension = parts[parts.length - 1];
    return extension && extension !== fileName ? extension : "bin";
}


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
            },
        })
        return res.status(200).json({
            message: "folders fetched succesfully",
            data: folders
        })
    }

})

app.post("/createFile", authMiddleware, async(req: Request, res: Response)=>{
    const validation = fileSchema.safeParse(req.body)

    if(!validation.success){
        return res.status(400).json({
            message: "kuch toh gadbad hai", 
            error: validation.error
        })
    }

    const { title, type, filelink, parentId } = validation.data

    const file = await prisma.file.create({
        data:{
            title: title,
            type: type,
            fileLink: filelink,
            parentId: parentId,
            userId: req.user!.userId
        } 
    })

    res.status(200).json({
        message: "file created succesfully",
        data: file
    })
})

app.get("/files/:parentId", authMiddleware, async(req: Request, res: Response)=>{
    const parentId = req.params.parentId as string

    const files = await prisma.file.findMany({
        where:{
            userId: req.user!.userId,
            parentId: parentId
        }
    })

    return res.status(200).json({
        message: "files fetched succesfully",
        data: files
    })
})


app.post("/presign", async (req, res) => {
  const { fileName, fileType } = req.body ?? {};

  if (!fileName || !fileType) {
    return res.status(400).json({
      error: "fileName and fileType are required",
    });
  }

  if (!fileType.startsWith("image/")) {
    return res.status(400).json({
      error: "Only image uploads allowed",
    });
  }

  const extension = getFileExtension(fileName);
  const key = `abhishek/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60,
    });

    const publicUrl = ACCESS_URL
      ? `${ACCESS_URL.replace(/\/$/, "")}/${key}`
      : null;

    res.json({ signedUrl, key, publicUrl });
  } catch (error) {
    res.status(500).json({
      error: "Failed to generate URL",
    });
  }
});

app.listen(3001)