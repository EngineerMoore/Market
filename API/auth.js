const prisma = require(`../prisma`);

const express = require(`express`);
const router = express.Router();

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/* sign is a constructor and it has 
the attributes payload, key, and options (order matters).
jwt.sign() sets the values for each attribute*/
const createToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {expiresIn: "1d"});
}

//TODO: 
const authenticationNextError = (field) => {
  if(!field){
     next({
      status: 400,
      message: `Attention, ${field} required`})
  }
};

// Find user according to token
  // req = Http fetch req sent by user;
  // the req is an object w/ method, body, and headers
  // headers: {...authorization: `Bearer ${token}` }
router.use( async (req, res, next) => {
  const authHeader = req.headers.authorization;

// Only the token is stored in the db so we need to remove `bearer`
  const token = authHeader?.slice(7); // Bearer <token>

  /* TODO: Q: next()? allows users to get token or
  verify their token. If we checked for a false token first,
  we'd have to send a next({}) and stop the process
  before setting the req.user, removing the user's oppourtunity
  to obtain a token. */
  if (!token) return next();

  try {
    const { id } = jwt.verify(token, JWT_SECRET);

    // TODO: why are we just doing { id } instead of {id: +id}?
    const user = await prisma.user.findUniqueOrThrow({ where: { id } })

    /* TODO: req.user = user; where does this come from?..is this creating the user attribute and 
    simultaneously setting the value? */
    req.user = user;
    next();

  } catch(e) {
    next(e);
  }
});



router.post("/register", async(req, res, next) => {
  const { username, password } = req.body;

  authenticationNextError(`${username}`);
  authenticationNextError(`${password}`);

  try{
    const user = await prisma.user.register(username, password);
    
    /* TODO: Confirm, token created here so user is automcatically signed in
    upon registration? */ 
    // Q: user.id? A: const user step creates a new user object in our database using the register method
    const token = createToken(user.id);
    res.status(201).json({ token });
  } catch(e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  authenticationNextError(`${username}`);
  authenticationNextError(`${password}`);

  try { 
    const user = await prisma.user.login(username, password);

    const token = createToken(user.id);
    res.json({ token })
  } catch(e) {
    next(e);
  }
});

const authenticate = (req, res, next) => {
  req.user?
  next():
  next({ status: 401, message: `You must be logged in.`});
}

module.exports = { router, authenticate, };