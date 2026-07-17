import jwt from "jsonwebtoken"
const isAuth=async (req,res,next)=>
{
    try{
        console.log("Cookies received on backend:", req.cookies);
        const token=req.cookies.token
        console.log("Token from cookies:", token);
        if(!token)
        {
            return res.status(401).json({message: "Token not found"})
        }
        const verifyToken=jwt.verify(token,process.env.JWT_SECRET)
        req.userId=verifyToken.userId;
        next()
    }
    catch(error){
        console.log(error)
        return res.status(401).json({message:"Invalid or expired token"})
    }
}

export default isAuth