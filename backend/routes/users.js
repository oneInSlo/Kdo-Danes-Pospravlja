const express = require('express');
const router = express.Router();
// const authenticateToken = require('./authenticateToken');
const knex = require('knex');
const authMiddleware = require('./authMiddleware');
const knexConfig = require('../knexfile').development;

const db = knex(knexConfig);
const ERROR500MSG = 'Napaka na strežniku. Poskusite kasneje.';

//Pridobivanje vseh uporabnikov, ki imajo skupno bivalno enoto z trenutnim uporabnikom
router.get('/users/shared', authMiddleware, async (req, res) => {
    const user = req.user.user;
    const userID = user.id_registriran_uporabnik;

    try {
        const userUnits = await db('stanovalec')
            .where({ TK_registriran_uporabnik: userID })
            .select('TK_bivalna_enota');

        if (userUnits.length === 0) {
            return res.status(404).json({ msg: 'Uporabnik ni v nobeni enoti.' });
        }

        const unitIDs = userUnits.map(unit => unit.TK_bivalna_enota);

        const sharedUsers = await db('stanovalec')
            .whereIn('TK_bivalna_enota', unitIDs)
            .whereNot({ TK_registriran_uporabnik: userID }) 
            .join('registriran_uporabnik', 'stanovalec.TK_registriran_uporabnik', '=', 'registriran_uporabnik.id_registriran_uporabnik')
            .select('registriran_uporabnik.username');

        return res.status(200).json({ sharedUsers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: ERROR500MSG });
    }
});


//Pridobivanje userja glede na username
router.get('/users', authMiddleware, async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ msg: 'Uporabniško ime je obvezno.' });
    }

    try {
        const user = await db('registriran_uporabnik')
            .where('username', username)
            .select('id_registriran_uporabnik', 'username')
            .first();

        if (!user) {
            return res.status(404).json({ msg: 'Ni uporabnikov s tem uporabniškim imenom.' });
        }

        return res.status(200).json({ username: user.username });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: ERROR500MSG });
    }
});


//posodabljanje pravic glede na username 
router.patch('/users/rights', authMiddleware, async (req, res) => {
    const { username } = req.query;
    const { right, unit_id } = req.body;
    const user = req.user.user;
    const userID = user.id_registriran_uporabnik;

    if (!username) {
        return res.status(400).json({ msg: 'Uporabniško ime je obvezno.' });
    }

    try {
        const selectedUser = await db('registriran_uporabnik')
            .where({ username })
            .first();
            
        if (!selectedUser){
            return res.status(404).json({ msg: "Uporabnik s tem imenom ne obstaja"});
        }

        const selectedStanovalec = await db('stanovalec')
            .where({ TK_registriran_uporabnik: selectedUser.id_registriran_uporabnik, TK_bivalna_enota: unit_id })
            .first();
        

        if (!selectedStanovalec){
            return res.status(404).json({ msg: "Uporabnik ni stanovalec"});
        }

        const selectedCreator = await db('bivalna_enota')
                    .where({ id_bivalna_enota: unit_id, TK_registriran_uporabnik: selectedUser.id_registriran_uporabnik })
                    .first();

        if(selectedCreator){
            return res.status(403).json({ msg: "Ustvarjalcu bivalne enote ne morete spreminjati pravic." });
        }

        const userStanovalec = await db('stanovalec').where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: unit_id }).first();

        console.log('Pravice: ' + userStanovalec.pravice);
        if(userStanovalec.pravice == "popolne"){
            await db('stanovalec')
                .where("id_stanovalec", selectedStanovalec.id_stanovalec)
                .update({ pravice: right });

            const updatedStanovalec = await db('stanovalec')
                        .where("id_stanovalec", selectedStanovalec.id_stanovalec)
                        .select("pravice")
                        .first();
            
            return res.status(200).json({ msg: "Pravice uspešno posodobljene", pravice: updatedStanovalec });

        } else{
            return res.status(403).json({ msg: 'Nimate pravic za spreminjanje.' })
        }
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Napaka pri posodabljanju pravic." });
    }
});

module.exports = router;
