const express = require('express');
const router = express.Router();
// const authenticateToken = require('./authenticateToken');
const authMiddleware = require('./authMiddleware');
const multer = require('multer');
const path = require('path');
const knex = require('knex');
const knexConfig = require('../knexfile').development;

const db = knex(knexConfig);
const ERROR500MSG = 'Napaka na strežniku. Poskusite kasneje.';

// Pridobivanje vseh enot vključno s slikami in najemniki
router.get('/units', authMiddleware, async (req, res) => {
    const userId = req.user.user.id_registriran_uporabnik;

    try {
        const userUnits = await db('stanovalec')
            .where({ TK_registriran_uporabnik: userId })
            .select('TK_bivalna_enota');

        if (userUnits.length === 0) {
            return res.status(404);
        }

        const unitIds = userUnits.map(unit => unit.TK_bivalna_enota);

        const units = await db('bivalna_enota').whereIn('id_bivalna_enota', unitIds);

        const pictures = await db('slika').whereIn('TK_bivalna_enota', unitIds);

        const spaces = await db('prostor')
            .whereIn('TK_bivalna_enota', unitIds)
            .select('TK_bivalna_enota', 'naziv');
        
        const tenants = await db('stanovalec')
            .join('bivalna_enota', 'stanovalec.TK_bivalna_enota', 'bivalna_enota.id_bivalna_enota')
            .join('registriran_uporabnik', 'stanovalec.TK_registriran_uporabnik', '=', 'registriran_uporabnik.id_registriran_uporabnik')
            .leftJoin('avatar', 'registriran_uporabnik.TK_avatar', 'avatar.id_avatar')
            .whereIn('bivalna_enota.id_bivalna_enota', unitIds)
            .select(
                'registriran_uporabnik.id_registriran_uporabnik',
                'registriran_uporabnik.ime_priimek',
                'registriran_uporabnik.username',
                'avatar.avatar_foto',
                'stanovalec.TK_bivalna_enota',
                'stanovalec.pravice'
            );

        const unitsWithDetails = units.map(unit => {
            const unitPictures = pictures.filter(pic => pic.TK_bivalna_enota === unit.id_bivalna_enota);
            const unitTenants = tenants.filter(tenant => tenant.TK_bivalna_enota === unit.id_bivalna_enota);
            const unitSpaces = spaces.filter(space => space.TK_bivalna_enota === unit.id_bivalna_enota);

            return {
                ...unit,
                slike: unitPictures.map(pic => pic.slika_foto),
                sostanovalci: unitTenants.map(tenant => ({
                    id: tenant.id_registriran_uporabnik,
                    name: tenant.ime_priimek,
                    username: tenant.username,
                    avatar: tenant.avatar_foto,
                    right: tenant.pravice
                })),
                prostori: unitSpaces.map(space => space.naziv)
            };
        });

        return res.status(200).json(unitsWithDetails);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: ERROR500MSG });
    }
});

  // Pridobivanje specifične enote vključno s slikami in najemniki
router.get('/units/:id', authMiddleware, async (req, res) => {
    const userId = req.user.user.id_registriran_uporabnik;
    const { id } = req.params;

    try {
        const userUnit = await db('stanovalec')
            .where({ TK_registriran_uporabnik: userId, TK_bivalna_enota: id })
            .first();

        if (!userUnit) {
            return res.status(403).json({ msg: 'Uporabnik nima dostopa do te enote' });
        }

        const unit = await db('bivalna_enota').where({ id_bivalna_enota: id }).first();

        if (!unit) {
            return res.status(404).json({ msg: 'Enota ne obstaja' });
        }

        const pictures = await db('slika').where({ TK_bivalna_enota: id });

        const spaces = await db('prostor').where({ TK_bivalna_enota: id }).select('naziv');

        const tenants = await db('stanovalec')
            .join('bivalna_enota', 'stanovalec.TK_bivalna_enota', 'bivalna_enota.id_bivalna_enota')
            .join('registriran_uporabnik', 'stanovalec.TK_registriran_uporabnik', '=', 'registriran_uporabnik.id_registriran_uporabnik')
            .leftJoin('avatar', 'registriran_uporabnik.TK_avatar', 'avatar.id_avatar')
            .where('bivalna_enota.id_bivalna_enota', id)
            .select(
                'registriran_uporabnik.id_registriran_uporabnik',
                'registriran_uporabnik.ime_priimek',
                'registriran_uporabnik.username',
                'avatar.avatar_foto',
                'stanovalec.TK_bivalna_enota',
                'stanovalec.pravice'
            );

        const unitWithDetails = {
            ...unit,
            slike: pictures.map(pic => pic.slika_foto),
            sostanovalci: tenants.map(tenant => ({
                name: tenant.ime_priimek,
                username: tenant.username,
                avatar: tenant.avatar_foto,
                right: tenant.pravice
            })),
            prostori: spaces.map(space => space.naziv),
        };

        return res.status(200).json(unitWithDetails);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: ERROR500MSG });
    }
});

// Ustvarjanje nove bivalne enote
router.post('/units', authMiddleware, async (req, res) => {
    try {
        const { naziv, naslov, mesto, posta, drzava, prostori, slike } = req.body;
        const user = req.user.user;
        const userID = user.id_registriran_uporabnik;

        if (!naziv || !naslov || !mesto || !posta || !drzava || !prostori || !Array.isArray(prostori)) {
            return res.status(400).json({ msg: 'Bad Request: All fields must be provided and prostori must be an array' });
        }

        console.log("Received data:", { naziv, naslov, mesto, posta, drzava, prostori, slike });

        if (!slike || !Array.isArray(slike)) {
            return res.status(400).json({ msg: 'Bad Request: slike must be an array' });
        }

        const imagePaths = slike.map(imageObj => {
            console.log("Evo slika", imageObj);
            return imageObj.path;
        });

        console.log("image paths", imagePaths);

        const fullNaslov = `${naslov}, ${mesto}, ${posta}, ${drzava}`;

        const [newUnitId] = await db('bivalna_enota').insert({ 
            naziv, 
            naslov: fullNaslov, 
            TK_registriran_uporabnik: userID 
        });

        if (imagePaths.length > 0) {
            const slikaInserts = imagePaths.map(slika => ({ 
                slika_foto: slika, 
                TK_bivalna_enota: newUnitId 
            }));
            console.log("Image inserts:", slikaInserts);
            await db('slika').insert(slikaInserts);
        }

        if (prostori) {
            const prostoriInserts = prostori.map(prostor => ({ 
                naziv: prostor, 
                TK_bivalna_enota: newUnitId 
            }));
            await db('prostor').insert(prostoriInserts);
            
        } else {
            const prostoriInserts = prostori.map(prostor => ({ 
                naziv: 'default',
                TK_bivalna_enota: newUnitId 
            }));
            await db('prostor').insert(prostoriInserts);
        }

        if (userID) {
            await db('stanovalec').insert({ 
                TK_registriran_uporabnik: userID, 
                TK_bivalna_enota: newUnitId, 
                pravice: 'popolne' 
            });
        } else {
            return res.status(403).json({ msg: 'Nisi prijavljen.' });
        }

        const newUnit = await db('bivalna_enota')
                            .where({ id_bivalna_enota: newUnitId})
                            .first();

        const slike_res = await db('slika')
                            .where({ TK_bivalna_enota: newUnitId })
                            .select('slika_foto');
                    
        const prostori_res = await db('prostor')
                            .where({ TK_bivalna_enota: newUnitId })
                            .select('naziv');
                    
        const [street, city, postal_code, country] = newUnit.naslov.split(', ');
                    
        const unitDetails = {
            id: newUnit.id_bivalna_enota,
            name: newUnit.naziv,
            street,
            city,
            postal_code,
            country,
            pictures: slike_res.map(s => s.slika_foto),
            spaces: prostori_res.map(p => p.naziv)
        };         

        return res.status(200).json({ msg: 'Enota uspešno ustvarjena.', data: unitDetails});

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: ERROR500MSG });
    }
});

// Posodabljanje enote
router.put('/units/:idUnit', authMiddleware, async (req, res) => {
    const { idUnit } = req.params;
    const { naziv, naslov, mesto, posta, drzava, prostori, deleteProstori } = req.body;
    const user = req.user.user;
    const userID = user.id_registriran_uporabnik;

    if ((!naziv && !naslov && !mesto && !posta && !drzava && !prostori) || (prostori && !Array.isArray(prostori)) || (deleteProstori && !Array.isArray(deleteProstori))) {
        return res.status(400).json({ msg: 'Bad Request: Invalid input' });
    }

    try {
        const isUserInUnit = await db('stanovalec')
            .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: idUnit })
            .first();

        if (!isUserInUnit) {
            return res.status(403).json({ msg: 'Uporabnik nima dostopa do te enote' });
        }

        const existingUnit = await db('bivalna_enota').where({ id_bivalna_enota: idUnit }).first();

        if (!existingUnit) {
            return res.status(404).json({ msg: 'Enota ne obstaja' });
        }

        const updatedUnitData = {
            naziv: naziv || existingUnit.naziv,
            naslov: naslov + ", " + mesto + ", " + posta + ", " + drzava || `${existingUnit.naslov}`
        };

        await db('bivalna_enota').where({ id_bivalna_enota: idUnit }).update(updatedUnitData);

        if (deleteProstori) {
            await db('prostor').whereIn('naziv', deleteProstori).andWhere({ TK_bivalna_enota: idUnit }).del();
        }

        if (prostori) {
            const existingProstori = await db('prostor').where({ TK_bivalna_enota: idUnit }).select('naziv');
            const existingProstoriNazivi = existingProstori.map(p => p.naziv);

            const newProstori = prostori.filter(prostor => !existingProstoriNazivi.includes(prostor)).map(prostor => ({
                naziv: prostor,
                TK_bivalna_enota: idUnit
            }));

            if (newProstori.length > 0) {
                await db('prostor').insert(newProstori);
            }
        }

        const updatedUnit = await db('bivalna_enota').where({ id_bivalna_enota: idUnit }).first();
        const unitProstori = await db('prostor').where({ TK_bivalna_enota: idUnit }).select('naziv');

        return res.status(200).json({ msg: { ...updatedUnit, prostori: unitProstori } });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: ERROR500MSG });
    }
});



// Pridobivanje stanovalcev za specificno bivalno enoto
router.get('/units/:idUnit/users', authMiddleware, async (req, res) => {
    const { idUnit } = req.params;
    const user = req.user.user;
    const userID = user.id_registriran_uporabnik;

    try {
        const isUserInUnit = await db('stanovalec')
            .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: idUnit })
            .first();

        if (!isUserInUnit) {
            return res.status(403).json({ msg: 'Uporabnik nima dostopa do te enote' });
        }

        const unitUsers = await db('stanovalec')
            .join('bivalna_enota', 'stanovalec.TK_bivalna_enota', 'bivalna_enota.id_bivalna_enota')
            .join('registriran_uporabnik', 'stanovalec.TK_registriran_uporabnik', '=', 'registriran_uporabnik.id_registriran_uporabnik')
            .where('bivalna_enota.id_bivalna_enota', idUnit)
            .select('registriran_uporabnik.*');

        return res.status(200).json({ msg: unitUsers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: ERROR500MSG });
    }
});


// Dodajanje stanovalca na bivalno enoto
router.post('/units/:idUnit/users/:username', authMiddleware, async (req, res) => {
    const { idUnit, username } = req.params;
    const { pravice } = req.body;
    const user = req.user.user;
    const userID = user.id_registriran_uporabnik;

    try {
        const userPermissions = await db('stanovalec')
            .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: idUnit })
            .select('pravice')
            .first();

        if (!userPermissions || userPermissions.pravice !== 'popolne') {
            return res.status(403).json({ msg: 'Nimate dovoljenja za dodajanje uporabnikov v to enoto' });
        }

        const existingUser = await db('stanovalec')
            .join('registriran_uporabnik', 'stanovalec.TK_registriran_uporabnik', '=', 'registriran_uporabnik.id_registriran_uporabnik')
            .where({ username })
            .andWhere('stanovalec.TK_bivalna_enota', idUnit)
            .first();

        if (existingUser) {
            return res.status(401).json({ msg: 'Uporabnik je že v enoti.' });
        }

        const userRecord = await db('registriran_uporabnik').where({ username }).select('id_registriran_uporabnik').first();
        if (!userRecord) {
            return res.status(404).json({ msg: 'Registriran uporabnik ne obstaja' });
        }

        const newUserID = userRecord.id_registriran_uporabnik;

        const existingUnit = await db('bivalna_enota').where({ id_bivalna_enota: idUnit }).first();
        if (!existingUnit) {
            return res.status(404).json({ msg: 'Bivalna enota ne obstaja' });
        }

        const insertedStanovalec = await db('stanovalec').insert({
            TK_registriran_uporabnik: newUserID,
            TK_bivalna_enota: idUnit,
            pravice: pravice
        });

        return res.status(200).json({ msg: 'Uporabnik uspešno dodan v enoto.' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: ERROR500MSG });
    }
});


// Brisanje stanovalca iz bivalne enote
router.delete('/units/:idUnit/users/:username', authMiddleware, async (req, res) => {
    const { idUnit, username } = req.params;
    const user = req.user.user;
    const userID = user.id_registriran_uporabnik;

    try {
        const userPermissions = await db('stanovalec')
            .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: idUnit })
            .select('pravice')
            .first();

        if (!userPermissions || userPermissions.pravice !== 'popolne') {
            return res.status(403).json({ msg: 'Nimate dovoljenja za odstranjevanje uporabnikov iz te enote' });
        }

        const existingUser = await db('stanovalec')
            .join('registriran_uporabnik', 'stanovalec.TK_registriran_uporabnik', '=', 'registriran_uporabnik.id_registriran_uporabnik')
            .where({ username, TK_bivalna_enota: idUnit }).first();
        
        if (!existingUser) {
            return res.status(404).json({ msg: 'Uporabnik ni povezan s to enoto.' });
        }

        const creator_id = await db('registriran_uporabnik').select('id_registriran_uporabnik').where({ username }).first();

        const creator = await db('bivalna_enota')
                                .where({ id_bivalna_enota: idUnit, TK_registriran_uporabnik: creator_id.id_registriran_uporabnik } )
                                .first();
        
        if(creator) {
            return res.status(403).json({ msg: 'Nimate dovoljenja za odstranjevanje tega uporabnika iz te enote' });
        }

        if(!creator){
            await db('stanovalec')
            .join('registriran_uporabnik', 'stanovalec.TK_registriran_uporabnik', '=', 'registriran_uporabnik.id_registriran_uporabnik')
            .where({ username })
            .del();
            return res.status(200).json({ msg: 'Uporabnik uspešno odstranjen iz enote.' });
        }
        

        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: ERROR500MSG });
    }
});


//brisanje celotne bivalne enote
router.delete('/units/:idUnit', authMiddleware, async (req, res) => {
    const { idUnit } = req.params;
    const user = req.user.user;
    const userID = user.id_registriran_uporabnik;

    try {
        
        //preverjanje pravic in ali je povezan z enoto
        const userPermissions = await db('stanovalec')
            .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: idUnit })
            .select('pravice')
            .first();

        if (!userPermissions) {
            return res.status(404).json({ msg: 'Uporabnik ni povezan s to enoto.' });
        }

        if (userPermissions.pravice !== 'popolne') {
            return res.status(403).json({ msg: 'Nimate dovoljenja za odstranjevanje uporabnikov iz te enote' });
        }
        
        //preverjanje ali bivalna enota obstaja
        const existingUnit = await db('bivalna_enota')
        .where({ id_bivalna_enota: idUnit })
        .first();

        if (!existingUnit) {
            return res.status(404).json({ msg: 'Bivalna enota ne obstaja' });
        }


        //brisanje bivalne enote
        await db('bivalna_enota')
            .where({id_bivalna_enota: idUnit})
            .del();
        return res.status(200).json({ msg: 'Bivalna enota uspesno zbrisana.' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: ERROR500MSG });
    }
});


// Uploadanje slik
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const destinationDir = path.resolve('../backend/public/img/enote');
        cb(null, destinationDir);
    },

    filename: function(req, file, cb) {
        const user = req.user.user;
        const username = user ? user.username : 'unknown_user';
        
        const filename = Date.now() + '_' + username + path.extname(file.originalname);
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

router.post('/units/images/upload', authMiddleware, upload.array('images', 10), async (req, res) => {
    const uploadedFiles = req.files;

    const filePaths = uploadedFiles.map(file => {
        return {
            path: `./img/enote/${file.filename}`
        };
    });

    res.status(200).json({ data: filePaths });
});

module.exports = router;
