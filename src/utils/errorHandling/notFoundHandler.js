export const notFoundHandler= (req,res,next)=>{
    return next(new Error(`Api not found`,{cause:404}))
}