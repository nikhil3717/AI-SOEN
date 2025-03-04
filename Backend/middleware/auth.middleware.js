import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";


export const authUser = async (req, res, next) => {

  // console.log(req.headers.authorization.split(' ')[ 2 ])

  try{
    const token = req.cookies.token ||  req.headers.authorization.split(' ')[ 2 ] ;


    if(!token) {
      return res.status(401).send({error: "Unauthorized Users"})
    }

    const isBlackListed = await redisClient.get(token)

    if(isBlackListed) {
      res.cookie('token', '')
      return res.status(401).send({
        error: "Unauthorized User"
      })
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    
    req.user = decoded;
    next();

  } catch (err){
    console.log(err);
    res.status(401).send({error: "Unauthorized User"})
  }
}