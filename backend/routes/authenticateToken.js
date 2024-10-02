const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config({ path: './secret.env' });

const tokenSecret = process.env.TOKEN_SECRET;
if (!tokenSecret) {
  throw new Error('TOKEN_SECRET ni definiran.');
}


function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ msg: 'Dostop zavrnjen: Token ni bil podan.' });
  }

  try {
    const verified = jwt.verify(token, tokenSecret);
    req.user = verified.user;
    next();
  } catch (err) {
    res.status(403).json({ msg: 'Neveljaven Token' });
  }
}

module.exports = authenticateToken;
