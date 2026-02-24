import * as z from "zod"; 
 
export const userSchema = z.object({ 
    email: z.email(),
    password: z.string().min(6),
    name: z.string()
});

export const folderSchema = z.object({
    title: z.string(),
    parentId: z.string()
})