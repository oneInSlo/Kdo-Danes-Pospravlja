const express = require('express');
const router = express.Router();
const authenticateToken = require('./authenticateToken');
const knex = require('knex');
const knexConfig = require('../knexfile').development;

const db = knex(knexConfig);
const ERROR500MSG = 'Napaka na strežniku. Poskusite kasneje.';

// Pridobivanje določenega prostora po ID-ju
router.get('/rooms/:idRoom', authenticateToken, async (req, res) => {
    const { idRoom } = req.params;

    try {
        const room = await db('prostor').where({ id_prostor: idRoom }).first();
        if (!room) {
            return res.status(404).json({ msg: 'Prostor ni najden' });
        }

        return res.status(200).json(room);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: ERROR500MSG });
    }
});

// Pridobivanje vseh prostorov za enoto
router.get('/units/:idUnit/rooms', authenticateToken, async (req, res) => {
    const { idUnit } = req.params;

    try {
        const rooms = await db('prostor').where({ TK_bivalna_enota: idUnit });
        if (rooms.length === 0) {
            return res.status(404).json({ msg: 'Za to enoto ni najdenih prostorov' });
        }

        return res.status(200).json(rooms);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: ERROR500MSG });
    }
});

// Pridobivanje vseh prostorov za vse enote
router.get('/user/rooms', authenticateToken, async (req, res) => {
    const userId = req.user.id_registriran_uporabnik;

    try {
        const userUnits = await db('stanovalec')
            .where({ TK_registriran_uporabnik: userId })
            .select('TK_bivalna_enota');

        if (userUnits.length === 0) {
            return res.status(404).json({ msg: 'Uporabnik ni povezan z nobeno enoto' });
        }

        const unitIds = userUnits.map(unit => unit.TK_bivalna_enota);

        const rooms = await db('prostor').whereIn('TK_bivalna_enota', unitIds);

        if (rooms.length === 0) {
            return res.status(404).json({ msg: 'Za enote, povezane z uporabnikom, ni najdenih prostorov' });
        }

        return res.status(200).json(rooms);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: ERROR500MSG });
    }
});

//Uatvarjanje prostora
/*router.post('/rooms', authenticateToken, async (req, res) => {
    const { naziv, TK_bivalna_enota } = req.body;
  
    if (!naziv || !TK_bivalna_enota) {
      return res.status(400).json({ msg: 'Obvezno je navesti naziv in bivalno enoto.' });
    }
  
    try {
      const newRoom = {
        naziv,
        TK_bivalna_enota,
      };
  
      const insertedRoomId = await db('prostor').insert(newRoom).returning('id_prostor');
  
      if (!insertedRoomId) {
        return res.status(500).json({ msg: 'Napaka pri ustvarjanju prostora.' });
      }
  
      const createdRoom = await db('prostor').where({ id_prostor: insertedRoomId[0] }).first();
  
      return res.status(201).json(createdRoom);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: ERROR500MSG });
    }
  });

router.post*/

module.exports = router;