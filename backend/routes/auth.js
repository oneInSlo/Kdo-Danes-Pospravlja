const express = require('express');
const bcrypt = require('bcrypt');
//const cookieParser = require('cookie-parser');
const router = express.Router();
const knex = require('knex');
const knexConfig = require('../knexfile').development;
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./authenticateToken');

const db = knex(knexConfig);
const ERROR500MSG = 'Napaka na strežniku. Poskusite kasneje.';


dotenv.config({ path: './secret.env' });

const tokenSecret = process.env.TOKEN_SECRET;
if (!tokenSecret) {
  throw new Error('TOKEN_SECRET environment variable is not defined.');
}

router.use(express.json());


// Login
router.post('/login', async (req, res) => {
  const { email_username, password } = req.body;
  try {
    const user = await db('registriran_uporabnik')
      .where({ email: email_username })
      .orWhere({ username: email_username })
      .first();
    

    if (!user) {
      return res.status(401).json({ msg: 'E-naslov ali uporabniško ime ne obstaja.' });
    }

    //const hashedPassword = await bcrypt.hash(user.geslo, 10);
    const isPasswordCorrect = await bcrypt.compare(password, user.geslo);

    if (!isPasswordCorrect) {
      
      return res.status(401).json({ msg: 'Napačno geslo.' });
    }

    // kreiranje jwt tokena
    const token = jwt.sign({ user }, tokenSecret, { expiresIn: '4h' });

    // token se shrane v http-only cookie
    res.cookie('token', token, { httpOnly: true, /**secure: true, [ce je https se to doda]*/ maxAge: 4 * 60 * 60 * 1000 });

    //token posljemo v headerju ne v bodyju
    return res.status(200).header('Authorization', `Bearer ${token}`).json({ token, msg: 'Uspešna prijava' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: ERROR500MSG });
  }
});


// Registracija
router.post('/users', async (req, res) => {
  try {
    const {ime_priimek, datum_rojstva, username, geslo, email, avatar_naziv } = req.body;

    const existingUser = await db('registriran_uporabnik').where({ email }).orWhere({ username }).first();

    if (existingUser) {
      return res.status(400).json({ msg: 'Ta e-naslov ali uporabniško ime je že registriran/o.' });
    }

    const TK_avatar = await db('avatar').where({ naziv: avatar_naziv }).select('id_avatar');

    const hashedPassword = await bcrypt.hash(geslo, 10);

    const newUserInfo = {
      ime_priimek,
      datum_rojstva,
      username,
      geslo: hashedPassword,
      email,
      TK_avatar: TK_avatar[0].id_avatar
    };

    await db('registriran_uporabnik').insert(newUserInfo);

    res.status(200).json({ msg: 'Uspešna registracija' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: ERROR500MSG });
  }
});


// Logout
router.post('/logout', (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ msg: 'Nisi prijavljen.' });
    }

    res.clearCookie('token');

    return res.status(200).json({ msg: 'Odjava uspešna.' });

  } catch (error) {
    return res.status(500).json({ msg: ERROR500MSG });
  }
});


// Get User Data
router.get('/user/logged', authenticateToken, async (req, res) => {
    const userID = req.user.id_registriran_uporabnik;

    try {
        const currentUser = await db('registriran_uporabnik')
            .where({ id_registriran_uporabnik: userID })
            .select('id_registriran_uporabnik', 'ime_priimek', 'username', 'email', 'TK_avatar')
            .first();

        if (!currentUser) {
            return res.status(404).json({ msg: 'Uporabnik ne obstaja' });
        }

        res.status(200).json(currentUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Napaka na strežniku. Poskusite kasneje.' });
    }
});

module.exports = router;
