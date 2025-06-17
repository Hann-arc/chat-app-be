import jwt from "jsonwebtoken";

export const auth = async (req, res, next) => {
  const { authorization } = req.headers;

  if(!authorization) return res.status(401).json({message: "Unauthorized: Token not provided"});

  const token = authorization.split(" ")[1];

  if(!token) return res.status(401).json({message: "Unauthorized: Token missing"});

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.user = decoded;

    next()
  } catch (error) {
    return res.status(401).json("Unauthorized: INvalid Token");
  }
};
