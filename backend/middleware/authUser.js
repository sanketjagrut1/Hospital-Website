// import jwt from 'jsonwebtoken'

// // user authentication middleware
// const authUser = async (req, res, next) => {
//     const { token } = req.headers
//     if (!token) {
//         return res.json({ success: false, message: 'Not Authorized Login Again' })
//     }
//     try {
//         const token_decode = jwt.verify(token, process.env.JWT_SECRET)
//         req.body.userId = token_decode.id
//         next()
//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// export default authUser;
// backend/middleware/authUser.js
import jwt from 'jsonwebtoken'

// user authentication middleware
const authUser = async (req, res, next) => {
  const { token } = req.headers;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not Authorized. Login Again.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // set userId on req (safe for GET/POST)
    next();
  } catch (error) {
    console.error("authUser error:", error);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export default authUser;
