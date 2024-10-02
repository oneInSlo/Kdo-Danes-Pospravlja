const express = require('express');
const router = express.Router();
const authenticateToken = require('./authenticateToken');
const {updateRecurringTasks} = require('../taskService/responsibleUsers');


const knex = require('knex');
const authMiddleware = require('./authMiddleware');
const knexConfig = require('../knexfile').development;

const db = knex(knexConfig);
const ERROR500MSG = 'Napaka na strežniku. Poskusite kasneje.';


// Pregled ekratnih opravil v izbrani bivalni enoti
router.get('/units/:idUnit/tasks/onetime', authMiddleware, async (req, res) => {
  try {
    const { idUnit } = req.params;
    const user = req.user.user;
    const userID = user.id_registriran_uporabnik;

    const userStanovalec = await db('stanovalec')
      .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: idUnit })
      .first();

    if (!userStanovalec) {
      return res.status(403).json({ msg: 'Uporabnik nima dostopa do te enote' });
    }

    const oneTimeTasks = await db('enkratno_opravilo')
      .join('prostor_enkratno', 'enkratno_opravilo.id_enkratno_opravilo', 'prostor_enkratno.TK_enkratno_opravilo')
      .join('prostor', 'prostor_enkratno.TK_prostor', 'prostor.id_prostor')
      .join('bivalna_enota', 'prostor.TK_bivalna_enota', 'bivalna_enota.id_bivalna_enota')
      .join('stanovalec', 'enkratno_opravilo.TK_stanovalec', 'stanovalec.id_stanovalec')
      .join('registriran_uporabnik', 'stanovalec.TK_registriran_uporabnik', 'id_registriran_uporabnik')
      .where({ 'bivalna_enota.id_bivalna_enota': idUnit, 'enkratno_opravilo.opravljeno': 0 })
      .select(
        db.raw('id_enkratno_opravilo as id'),
        db.raw('enkratno_opravilo.naziv as title'),
        db.raw('enkratno_opravilo.trajanje as duration'),
        db.raw('prostor.naziv as room'),
        db.raw('UNIX_TIMESTAMP(datum_dodajanja) as dateAdded'),
        db.raw('UNIX_TIMESTAMP(datum_zadnje_spremembe) as lastChange'),
        db.raw('UNIX_TIMESTAMP(enkratno_opravilo.rok) as dueDate'),
        db.raw('registriran_uporabnik.username as responsibleUsers')
      );

    let response = []
    if (oneTimeTasks.length > 0) {
      response = {
        data: oneTimeTasks.map(task => ({
          ...task,
          responsibleUsers: [task.responsibleUsers],
        })),
      };
    }


    return res.status(200).json(response);

  } catch (error) {
    console.log(error)
    return res.status(500).json({ msg: ERROR500MSG, debug: error });

  }
});


// Pregled ponavljajočih opravil v izbrani bivalni enoti
router.get('/units/:idUnit/tasks/repeating', authMiddleware, async (req, res) => {

  try {
    const { idUnit } = req.params;

    const user = req.user.user;
    const userID = user.id_registriran_uporabnik;


    const userStanovalec = await db('stanovalec')
      .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: idUnit })
      .first();


    if (!userStanovalec) {
      return res.status(403).json({ msg: 'Uporabnik nima dostopa do te enote' });
    }

    const repeatingTasks = await db('ponavljajoce_opravilo')
      .join('seznam_odgovornih', 'ponavljajoce_opravilo.TK_seznam_odgovornih', 'seznam_odgovornih.id_seznam_odgovornih')
      .join('prostor_veckratno', 'ponavljajoce_opravilo.id_ponavljajoce_opravilo', 'prostor_veckratno.TK_ponavljajoce_opravilo')
      .join('prostor', 'prostor_veckratno.TK_prostor', 'prostor.id_prostor')
      .join('bivalna_enota', 'prostor.TK_bivalna_enota', 'bivalna_enota.id_bivalna_enota')
      .where({ 'bivalna_enota.id_bivalna_enota': idUnit, 'seznam_odgovornih.opravljeno': 0 })
      .select(
        db.raw('id_ponavljajoce_opravilo as id'),
        db.raw('ponavljajoce_opravilo.naziv as title'),
        db.raw('ponavljajoce_opravilo.trajanje as duration'),
        db.raw('prostor.naziv as room'),
        db.raw('UNIX_TIMESTAMP(datum_dodajanja) as dateAdded'),
        db.raw('UNIX_TIMESTAMP(datum_zadnje_spremembe) as lastChange'),
        db.raw('UNIX_TIMESTAMP(datum_zacetka) as startDate'),
        db.raw('UNIX_TIMESTAMP(datum_konca) as endDate'),
        db.raw('ponavljajoce_opravilo.ponavljanje as frequency'),
      );

    /*
    const AllResponsibleUsers = await db('seznam_odgovornih')
        .join('stanovalec', 'stanovalec.id_stanovalec', 'seznam_odgovornih.TK_stanovalec')
        .join('registriran_uporabnik', 'stanovalec.TK_registriran_uporabnik', 'registriran_uporabnik.id_registriran_uporabnik')
        .groupBy('seznam_odgovornih.TK_ponavljajoce_opravilo')
        .where({ 'stanovalec.TK_bivalna_enota': idUnit })
        .select('registriran_uporabnik.username');
    */

    const AllResponsibleUsers = await db('seznam_odgovornih')
      .join('stanovalec', 'stanovalec.id_stanovalec', 'seznam_odgovornih.TK_stanovalec')
      .join('registriran_uporabnik', 'stanovalec.TK_registriran_uporabnik', 'registriran_uporabnik.id_registriran_uporabnik')
      .select(
        'TK_ponavljajoce_opravilo',
        db.raw('GROUP_CONCAT(TK_stanovalec) AS TK_stanovalec_list'),
        db.raw('GROUP_CONCAT(registriran_uporabnik.username) AS username_list')
      )
      .groupBy('TK_ponavljajoce_opravilo')
      .whereIn('TK_ponavljajoce_opravilo', repeatingTasks.map(task => task.id))
      .then(rows => rows.reduce((acc, row) => {
        acc[row.TK_ponavljajoce_opravilo] = {
          username: row.username_list.split(',')
        };
        return acc;
      }, {}))
      .catch(err => {
        console.error(err);
      });

      const combinedData = repeatingTasks.map(task => ({
        ...task,
        responsibleUsers: AllResponsibleUsers[task.id] || []
      }));


    return res.status(200).json({ data: combinedData });

  } catch (error) {
    console.log(error)
    return res.status(500).json({ msg: ERROR500MSG });

  }

});

//Dodajanje novega enkratnega opravila
router.post('/units/:unit_id/tasks/onetime', authMiddleware, async (req, res) => {
  const { unit_id } = req.params;
  const currentDate = new Date().toISOString().slice(0, 10);
  const { rok, naziv, trajanje, prostor_naziv, responsibleUsers } = req.body;
  const user = req.user.user;
  const userID = user.id_registriran_uporabnik;

  try {
    const unit = await db('bivalna_enota').where({ id_bivalna_enota: unit_id }).first();

    if (!unit) {
      return res.status(404).json({ msg: 'Enota ne obstaja' });
    }

    const creatorInUnit = await db('stanovalec')
      .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: unit_id })
      .first();

    if (!creatorInUnit) {
      return res.status(403).json({ msg: 'Uporabnik nima dostopa do te enote' });
    }

    const userPermissions = await db('stanovalec')
      .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: unit_id })
      .select('pravice')
      .first();

    if (!userPermissions || userPermissions.pravice !== 'popolne') {
      return res.status(403).json({ msg: 'Nimate dovoljenja za dodajanje opravil v to enoto' });
    }

    let odgovorenStanovalec;
    if (responsibleUsers && responsibleUsers.length > 0) {
      const responsibleUser = await db('registriran_uporabnik')
        .select('id_registriran_uporabnik')
        .where({ username: responsibleUsers[0] })
        .first();

      if (!responsibleUser) {
        return res.status(400).json({ msg: 'Odgovorna oseba ne obstaja.' });
      }

      const responsibleUserInUnit = await db('stanovalec')
        .where({ TK_registriran_uporabnik: responsibleUser.id_registriran_uporabnik, TK_bivalna_enota: unit_id })
        .first();

      if (!responsibleUserInUnit) {
        return res.status(400).json({ msg: 'Odgovorna oseba ni v enoti.' });
      }

      odgovorenStanovalec = await db('stanovalec')
        .select('id_stanovalec')
        .where({ TK_registriran_uporabnik: responsibleUser.id_registriran_uporabnik })
        .first();
    } else {
      return res.status(400).json({ msg: 'Odgovorna oseba ni podana.' });
    }

    if (!odgovorenStanovalec) {
      return res.status(400).json({ msg: "Podana odgovorna oseba ne more biti dodana na enoto" });
    }

    const newTask = {
      rok,
      naziv,
      trajanje,
      datum_dodajanja: currentDate,
      datum_zadnje_spremembe: currentDate,
      opravljeno: 0,
      TK_stanovalec: odgovorenStanovalec.id_stanovalec
    };

    const result = await db('enkratno_opravilo').insert(newTask);

    const insertedTask = await db('enkratno_opravilo')
      .select(
        'id_enkratno_opravilo as id',
        'naziv',
        'trajanje',
        db.raw('UNIX_TIMESTAMP(datum_dodajanja) as datum_dodajanja'),
        db.raw('UNIX_TIMESTAMP(datum_zadnje_spremembe) as datum_zadnje_spremembe'),
        'opravljeno',
        'TK_stanovalec'
      )
      .where({ id_enkratno_opravilo: result[0] })
      .first();

    if (prostor_naziv) {
      const prostor = await db('prostor')
        .select('id_prostor')
        .where({ naziv: prostor_naziv, TK_bivalna_enota: unit_id })
        .first();

      if (prostor) {
        await db('prostor_enkratno')
          .insert({ TK_enkratno_opravilo: insertedTask.id, TK_prostor: prostor.id_prostor });

        return res.status(200).json({ msg: 'Enkratno opravilo uspešno ustvarjeno.', data: insertedTask });
      } else {
        return res.status(404).json({ msg: 'Prostor ne obstaja.' });
      }
    } else {
      let defaultProstor = await db('prostor')
        .select('id_prostor')
        .where({ naziv: 'default', TK_bivalna_enota: unit_id })
        .first();

      if (!defaultProstor) {
        const [newDefaultProstorID] = await db('prostor')
          .insert({ naziv: 'default', TK_bivalna_enota: unit_id });
        defaultProstor = { id_prostor: newDefaultProstorID };
      }

      await db('prostor_enkratno')
        .insert({ TK_enkratno_opravilo: insertedTask.id, TK_prostor: defaultProstor.id_prostor });

      return res.status(200).json({ msg: 'Enkratno opravilo uspešno ustvarjeno.', data: insertedTask });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: ERROR500MSG });
  }
});



//Dodajanje novega veckratnega opravila
router.post('/units/:unit_id/tasks/repeating', authMiddleware, async (req, res) => {
  const { unit_id } = req.params;
  const currentDate = new Date().toISOString().slice(0, 10);
  const { naziv, trajanje, datum_zacetka, datum_konca, ponavljanje, prostor_naziv } = req.body;

  let { odgovorne_osebe } = req.body;
  //let potrebno_stevilo = odgovorne_osebe.length;

  if (!odgovorne_osebe) {
    return res.status(404).json({ msg: 'Potrebno je oznaciti vsaj eno odgovorno osebo.' })
  }

  if (!Array.isArray(odgovorne_osebe)) {
    odgovorne_osebe = odgovorne_osebe.split(',').map(item => item.trim());
  }

  const user = req.user.user;
  const userID = user.id_registriran_uporabnik;

  try {
    const unit = await db('bivalna_enota').where({ id_bivalna_enota: unit_id }).first();

    if (!unit) {
      return res.status(404).json({ msg: 'Enota ne obstaja' });
    }

    const stanovalec = await db('stanovalec')
      .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: unit_id })
      .first();

    if (!stanovalec) {
      return res.status(403).json({ msg: 'Uporabnik nima dostopa do te enote' });
    }

    const userPermissions = await db('stanovalec')
      .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: unit_id })
      .select('pravice')
      .first();

    if (!userPermissions || userPermissions.pravice !== 'popolne') {
      //return res.status(403).json({ msg: 'Nimate dovoljenja za dodajanje opravil v to enoto' });
    }

    // Insert the repeating task
    const newTask = {
      datum_zacetka: datum_zacetka,
      datum_konca: datum_konca,
      naziv: naziv,
      ponavljanje: ponavljanje,
      trajanje: trajanje,
      datum_dodajanja: currentDate,
      datum_zadnje_spremembe: currentDate,
      potrebno_stevilo: 1
    };

    const [taskID] = await db('ponavljajoce_opravilo').insert(newTask);

    // Insert related seznam_odgovornih entries
    const seznamOdgovornihIDs = [];
    for (const odgovorna_oseba of odgovorne_osebe) {
      const odgovornaOseba = await db('registriran_uporabnik')
        .where({ username: odgovorna_oseba })
        .first();

      if (!odgovornaOseba) {
        return res.status(404).json({ msg: `Izbrane osebe '${odgovorna_oseba}' ni mogoče najti.` });
      }

      const OdgovornaOsebaStanovalec = await db('stanovalec')
        .where({ TK_registriran_uporabnik: odgovornaOseba.id_registriran_uporabnik, TK_bivalna_enota: unit_id })
        .first();

      if (!OdgovornaOsebaStanovalec) {
        return res.status(403).json({ msg: `Izbrana oseba '${odgovorna_oseba}' ni v enoti.` });
      }

      const [seznamOdgovornihID] = await db('seznam_odgovornih').insert({
        TK_stanovalec: OdgovornaOsebaStanovalec.id_stanovalec,
        TK_ponavljajoce_opravilo: taskID,
        datum: currentDate,
        opravljeno: 0
      });

      seznamOdgovornihIDs.push(seznamOdgovornihID);
    }
    

    await db('ponavljajoce_opravilo')
      .where({ id_ponavljajoce_opravilo: taskID })
      .update({ TK_seznam_odgovornih: seznamOdgovornihIDs[0] });


    const insertedTask = await db('ponavljajoce_opravilo')
      .select(
        db.raw('id_ponavljajoce_opravilo as id'),
        db.raw('naziv'),
        db.raw('ponavljanje'),
        db.raw('trajanje'),
        db.raw('UNIX_TIMESTAMP(datum_zacetka) as datum_zacetka_unix'),
        db.raw('UNIX_TIMESTAMP(datum_konca) as datum_konca_unix'),
        db.raw('UNIX_TIMESTAMP(datum_dodajanja) as datum_dodajanja'),
        db.raw('UNIX_TIMESTAMP(datum_zadnje_spremembe) as datum_zadnje_spremembe'),
        db.raw('potrebno_stevilo'),
        db.raw('TK_seznam_odgovornih')
      )
      .where({ id_ponavljajoce_opravilo: taskID })
      .first();

    const lastInsertedTask = await db('ponavljajoce_opravilo')
      .orderBy('id_ponavljajoce_opravilo', 'desc')
      .first();

    if (prostor_naziv) {
      const prostor = await db('prostor').select('id_prostor').where({ naziv: prostor_naziv, TK_bivalna_enota: unit_id }).first();

      if (prostor) {
        const taskIntoSpace = await db('prostor_veckratno')
          .join('prostor', 'prostor.id_prostor', '=', 'prostor_veckratno.TK_prostor')
          .where({ 'prostor.id_prostor': prostor.id_prostor })
          .insert({ TK_ponavljajoce_opravilo: lastInsertedTask.id_ponavljajoce_opravilo, TK_prostor: prostor.id_prostor });

        return res.status(200).json({ msg: 'Večkratno opravilo uspešno ustvarjeno.', data: insertedTask });
      }

    } else {
      const defaultProstor = await db('prostor').select('id_prostor').where({ naziv: 'default' }).first();

      if (!defaultProstor) {
        const defaultProstorInsert = await db('prostor').insert({ naziv: 'default', TK_bivalna_enota: unit_id });
        const defaultProstor = await db('prostor').select('id_prostor').where({ naziv: 'default' }).first();

        const taskIntoSpace = await db('prostor_veckratno')
          .join('prostor', 'prostor.id_prostor', '=', 'prostor_veckratno.TK_prostor')
          .where({ 'prostor.id_prostor': defaultProstor.id_prostor })
          .insert({ TK_ponavljajoce_opravilo: lastInsertedTask.id_ponavljajoce_opravilo, TK_prostor: defaultProstor.id_prostor });

      } else {
        const taskIntoSpace = await db('prostor_veckratno')
          .join('prostor', 'prostor.id_prostor', '=', 'prostor_veckratno.TK_prostor')
          .where({ 'prostor.id_prostor': defaultProstor.id_prostor })
          .insert({ TK_ponavljajoce_opravilo: lastInsertedTask.id_ponavljajoce_opravilo, TK_prostor: defaultProstor.id_prostor });
      }

      updateRecurringTasks();
      return res.status(200).json({ msg: 'Večkratno opravilo uspešno ustvarjeno.', data: insertedTask });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: ERROR500MSG });
  }
});


//Urejanje onetime opravila
router.put('/units/:unit_id/tasks/:taskId/onetime', authMiddleware, async (req, res) => {
  const currentDate = new Date().toISOString().slice(0, 10);
  const { unit_id, taskId } = req.params;
  const { rok, naziv, trajanje, prostor_naziv } = req.body;
  const user = req.user.user;
  const userID = user.id_registriran_uporabnik;

  console.log(unit_id + ', ' + taskId);

  try {

    const unit = await db('bivalna_enota').where({ id_bivalna_enota: unit_id }).first();

    if (!unit) {
      return res.status(404).json({ msg: 'Enota ne obstaja' });
    }


    const isUserInUnit = await db('stanovalec')
      .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: unit_id })
      .first();

    if (!isUserInUnit) {
      return res.status(403).json({ msg: 'Uporabnik nima dostopa do te enote' });
    }


    const userPermissions = await db('stanovalec')
      .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: unit_id })
      .select('pravice')
      .first();

    if (!userPermissions || userPermissions.pravice !== 'popolne') {
      //return res.status(403).json({ msg: 'Nimate dovoljenja za dodajanje opravil v to enoto' });
    }

    const updatedTask = {
      rok: rok,
      naziv: naziv,
      trajanje: trajanje,
      datum_zadnje_spremembe: currentDate
    };

    const result = await db('enkratno_opravilo').where({ id_enkratno_opravilo: taskId }).update(updatedTask);

    const lastInsertedTask = await db('enkratno_opravilo')
      .orderBy('id_enkratno_opravilo', 'desc')
      .first();


    console.log(prostor_naziv);

    if (prostor_naziv) {
      const prostor = await db('prostor').select('id_prostor').where({ naziv: prostor_naziv, TK_bivalna_enota: unit_id }).first();

      if (prostor) {
        const taskIntoSpace = await db('prostor_enkratno')
          .join('prostor', 'prostor.id_prostor', '=', 'prostor_enkratno.TK_prostor')
          .where({ TK_enkratno_opravilo: lastInsertedTask.id_enkratno_opravilo })
          .update({ TK_prostor: prostor.id_prostor });

        return res.status(200).json({ msg: 'Enkratno opravilo uspešno posodobljeno.', data: lastInsertedTask });
      }
    } else {
      const defaultProstor = await db('prostor').select('id_prostor').where({ naziv: 'default' }).first();

      if (!defaultProstor) {
        const defaultProstorInsert = await db('prostor').insert({ naziv: 'default', TK_bivalna_enota: unit_id });
        const defaultProstor = await db('prostor').select('id_prostor').where({ naziv: 'default' }).first();

        const taskIntoSpace = await db('prostor_enkratno')
          .join('prostor', 'prostor.id_prostor', '=', 'prostor_enkratno.TK_prostor')
          .where({ 'prostor.id_prostor': defaultProstor.id_prostor })
          .insert({ TK_enkratno_opravilo: lastInsertedTask.id_enkratno_opravilo, TK_prostor: defaultProstor.id_prostor });
      } else {
        const taskIntoSpace = await db('prostor_enkratno')
          .join('prostor', 'prostor.id_prostor', '=', 'prostor_enkratno.TK_prostor')
          .where({ 'prostor.id_prostor': defaultProstor.id_prostor })
          .insert({ TK_enkratno_opravilo: lastInsertedTask.id_enkratno_opravilo, TK_prostor: defaultProstor.id_prostor });

      }

      return res.status(200).json({ msg: 'Enkratno opravilo uspešno posodobljeno.', data: lastInsertedTask });
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: ERROR500MSG });
  }
});


// Urejanje ponavljajocega opravila
router.put('/units/:unit_id/tasks/:taskId/repeating', authMiddleware, async (req, res) => {
  const currentDate = new Date().toISOString().slice(0, 10);
  const { unit_id, taskId } = req.params;
  const { naziv, trajanje, datum_zacetka, datum_konca, ponavljanje, potrebno_stevilo, prostor_naziv, responsibleUsers } = req.body;
  const user = req.user.user;
  const userID = user.id_registriran_uporabnik;

  try {

    const unit = await db('bivalna_enota').where({ id_bivalna_enota: unit_id }).first();

    if (!unit) {
      return res.status(404).json({ msg: 'Enota ne obstaja' });
    }


    const isUserInUnit = await db('stanovalec')
      .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: unit_id })
      .first();

    if (!isUserInUnit) {
      return res.status(403).json({ msg: 'Uporabnik nima dostopa do te enote' });
    }


    const userPermissions = await db('stanovalec')
      .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: unit_id })
      .select('pravice')
      .first();

    if (!userPermissions || userPermissions.pravice !== 'popolne') {
      //return res.status(403).json({ msg: 'Nimate dovoljenja za dodajanje opravil v to enoto' });
    }

    const taskExists = await db('ponavljajoce_opravilo')
                       .where('id_ponavljajoce_opravilo', taskId)
                       .first();

    if (!taskExists) {
      return res.status(400).json({ msg: 'Invalid taskId, no corresponding task found.' });
    }

    let firstInsertedId = null;

    if(responsibleUsers){
      console.log(responsibleUsers);
      const deletedSeznam = await db('seznam_odgovornih')
                                  .where({'seznam_odgovornih.TK_ponavljajoce_opravilo': taskId })
                                  .del();

      for (const resUser of responsibleUsers){

        const resUser_id = await db('registriran_uporabnik')  
                                      .where({ 'registriran_uporabnik.username': resUser })
                                      .first();
        console.log(resUser_id);

        const resUserStanovalec_id = await db('stanovalec')
                                          .where({ TK_registriran_uporabnik: resUser_id.id_registriran_uporabnik, TK_bivalna_enota: unit_id })
                                          .first()

        const newSeznamEntry = {
          TK_stanovalec: resUserStanovalec_id.id_stanovalec,
          TK_ponavljajoce_opravilo: taskId,
          datum: currentDate,
          opravljeno: 0
        }
                                
        try {
          const insertedSeznam = await db('seznam_odgovornih').insert(newSeznamEntry);
        
          const insertedIdRecord = await db('seznam_odgovornih')
                                        .select('id_seznam_odgovornih')
                                        .orderBy('id_seznam_odgovornih', 'desc')
                                        .first();
        
          const insertedId = insertedIdRecord.id_seznam_odgovornih;
        
          if (firstInsertedId === null) {
            firstInsertedId = insertedId;
          }
        } catch (error) {
          return res.status(500).json({ msg: 'Error inserting into seznam_odgovornih table.', error: error.message });
        }

      }
    } else {
      return res.status(404).json({ msg: 'Nobena odgovorna oseba ni bila izbrana.' })
    }

    
    const updatedTask = {
      datum_zacetka: datum_zacetka,
      datum_konca: datum_konca,
      naziv: naziv,
      ponavljanje: ponavljanje,
      trajanje: trajanje,
      datum_zadnje_spremembe: currentDate,
      potrebno_stevilo: potrebno_stevilo,
      TK_seznam_odgovornih: firstInsertedId
    };

    const result = await db('ponavljajoce_opravilo').where({ id_ponavljajoce_opravilo: taskId }).update(updatedTask);

    const lastInsertedTask = await db('ponavljajoce_opravilo')
      .orderBy('id_ponavljajoce_opravilo', 'desc')
      .first();

    if (prostor_naziv) {
      const prostor = await db('prostor').select('id_prostor').where({ naziv: prostor_naziv, TK_bivalna_enota: unit_id }).first();

      if (prostor) {
        const taskIntoSpace = await db('prostor_veckratno')
          .join('prostor', 'prostor.id_prostor', '=', 'prostor_veckratno.TK_prostor')
          .where({ TK_ponavljajoce_opravilo: lastInsertedTask.id_ponavljajoce_opravilo })
          .update({ TK_prostor: prostor.id_prostor });

        return res.status(200).json({ msg: 'Večkratno opravilo uspešno posodobljeno.', data: lastInsertedTask });
      }

    } else {
      const defaultProstor = await db('prostor').select('id_prostor').where({ naziv: 'default' }).first();

      if (!defaultProstor) {
        const defaultProstorInsert = await db('prostor').insert({ naziv: 'default', TK_bivalna_enota: unit_id });
        const defaultProstor = await db('prostor').select('id_prostor').where({ naziv: 'default' }).first();

        const taskIntoSpace = await db('prostor_veckratno')
          .join('prostor', 'prostor.id_prostor', '=', 'prostor_veckratno.TK_prostor')
          .where({ 'prostor.id_prostor': defaultProstor.id_prostor })
          .insert({ TK_ponavljajoce_opravilo: lastInsertedTask.id_ponavljajoce_opravilo, TK_prostor: defaultProstor.id_prostor });

      } else {
        const taskIntoSpace = await db('prostor_veckratno')
          .join('prostor', 'prostor.id_prostor', '=', 'prostor_veckratno.TK_prostor')
          .where({ 'prostor.id_prostor': defaultProstor.id_prostor })
          .insert({ TK_ponavljajoce_opravilo: lastInsertedTask.id_ponavljajoce_opravilo, TK_prostor: defaultProstor.id_prostor });
      }


      return res.status(200).json({ msg: 'Večkratno opravilo uspešno posodobljeno.', data: lastInsertedTask });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: ERROR500MSG });
  }
});


// Oznacevanje repeating taska as finished
router.post('/units/:unit_id/tasks/:taskId/repeating/finished', authMiddleware, async (req, res) => {
  const { unit_id, taskId } = req.params;
  const user = req.user.user;
  const userID = user.id_registriran_uporabnik;

  try {

    const unit = await db('bivalna_enota').where({ id_bivalna_enota: unit_id }).first();

    if (!unit) {
      return res.status(404).json({ msg: 'Enota ne obstaja' });
    }


    const isUserInUnit = await db('stanovalec')
      .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: unit_id })
      .first();

    if (!isUserInUnit) {
      return res.status(403).json({ msg: 'Uporabnik nima dostopa do te enote' });
    }

    const repeatingTask = await db('ponavljajoce_opravilo')
      .where({ id_ponavljajoce_opravilo: taskId })
      .first();

    if (!repeatingTask) {
      return res.status(404).json({ msg: 'Večkratno opravilo ne obstaja' });
    }

    await db('seznam_odgovornih')
      .where({ id_seznam_odgovornih: repeatingTask.TK_seznam_odgovornih })
      .update({ opravljeno: 1 });

    return res.status(200).json({ msg: 'Večkratno opravilo označeno kot opravljeno.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: ERROR500MSG });
  }
});

// Oznacevanje onetiime taska as finished
router.post('/units/:unit_id/tasks/:taskId/onetime/finished', authMiddleware, async (req, res) => {
  const { unit_id, taskId } = req.params;
  const user = req.user.user;
  const userID = user.id_registriran_uporabnik;

  try {
    const unit = await db('bivalna_enota').where({ id_bivalna_enota: unit_id }).first();

    if (!unit) {
      return res.status(404).json({ msg: 'Enota ne obstaja' });
    }


    const isUserInUnit = await db('stanovalec')
      .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: unit_id })
      .first();

    if (!isUserInUnit) {
      return res.status(403).json({ msg: 'Uporabnik nima dostopa do te enote' });
    }

    const task = await db('enkratno_opravilo')
      .where({ id_enkratno_opravilo: taskId })
      .first();

    if (!task) {
      return res.status(404).json({ msg: 'Enkratno opravilo ne obstaja.' });
    }

    await db('enkratno_opravilo')
      .where({ id_enkratno_opravilo: taskId })
      .update({ opravljeno: 1 });

    return res.status(200).json({ msg: 'Enkratno opravilo uspešno označeno kot opravljeno.' });
  } catch (error) {
    console.error('Napaka pri označevanju enkratnega opravila kot zaključeno:', error);
    return res.status(500).send();
  }
});


//Pridobivanje koncanih taskov
router.get('/units/:unit_id/tasks/finished', authMiddleware, async (req, res) => {
  const { unit_id } = req.params;
  const user = req.user.user;
  const userID = user.id_registriran_uporabnik;

  try {
    const unit = await db('bivalna_enota').where({ id_bivalna_enota: unit_id }).first();

    if (!unit) {
      return res.status(404).json({ msg: 'Enota ne obstaja' });
    }


    const isUserInUnit = await db('stanovalec')
      .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: unit_id })
      .first();

    if (!isUserInUnit) {
      return res.status(403).json({ msg: 'Uporabnik nima dostopa do te enote' });
    }

    let finishedOnetimeTasks = await db('enkratno_opravilo')
    .join('prostor_enkratno', 'prostor_enkratno.TK_enkratno_opravilo', 'enkratno_opravilo.id_enkratno_opravilo')
    .join('prostor', 'prostor_enkratno.TK_prostor', 'prostor.id_prostor')
    .join('stanovalec', 'id_stanovalec', 'TK_stanovalec')
    .join('registriran_uporabnik', 'stanovalec.TK_registriran_uporabnik', 'registriran_uporabnik.id_registriran_uporabnik')
    .where({ 'stanovalec.TK_registriran_uporabnik': userID, 'enkratno_opravilo.opravljeno': 1 })
    .select([
      'enkratno_opravilo.id_enkratno_opravilo',
      'enkratno_opravilo.rok',
      'enkratno_opravilo.naziv',
      'enkratno_opravilo.trajanje',
      db.raw('enkratno_opravilo.datum_dodajanja'),
      db.raw('enkratno_opravilo.datum_zadnje_spremembe'),
      'enkratno_opravilo.opravljeno',
      'enkratno_opravilo.TK_stanovalec',
      db.raw('GROUP_CONCAT(prostor.naziv ORDER BY prostor.naziv SEPARATOR \', \') AS prostor_naziv'),
      'registriran_uporabnik.username as odgovorne_osebe'
    ])
    .groupBy(
      'enkratno_opravilo.id_enkratno_opravilo',
      'enkratno_opravilo.rok',
      'enkratno_opravilo.naziv',
      'enkratno_opravilo.trajanje',
      'enkratno_opravilo.datum_dodajanja',
      'enkratno_opravilo.datum_zadnje_spremembe',
      'enkratno_opravilo.opravljeno',
      'enkratno_opravilo.TK_stanovalec'
    );

    finishedOnetimeTasks = finishedOnetimeTasks.map(task => {
      task['odgovorne_osebe'] = [task['odgovorne_osebe']]
      return task;
    });
  
    

    let finishedRepeatingTasks = await db('ponavljajoce_opravilo')
    .join('prostor_veckratno', 'prostor_veckratno.TK_ponavljajoce_opravilo', 'ponavljajoce_opravilo.id_ponavljajoce_opravilo')
    .join('prostor', 'prostor_veckratno.TK_prostor', 'prostor.id_prostor')
    .join('seznam_odgovornih', 'ponavljajoce_opravilo.TK_seznam_odgovornih', 'seznam_odgovornih.id_seznam_odgovornih')
    .join('stanovalec', 'stanovalec.id_stanovalec', 'seznam_odgovornih.TK_stanovalec')
    .join('registriran_uporabnik', 'registriran_uporabnik.id_registriran_uporabnik', 'stanovalec.TK_registriran_uporabnik')
    .where({ 'stanovalec.TK_bivalna_enota': unit_id, 'seznam_odgovornih.opravljeno': 1 })
    .select([
      'ponavljajoce_opravilo.id_ponavljajoce_opravilo',
      db.raw('UNIX_TIMESTAMP(ponavljajoce_opravilo.datum_zacetka) as datum_zacetka'),
      db.raw('UNIX_TIMESTAMP(ponavljajoce_opravilo.datum_konca) as datum_konca'),
      'ponavljajoce_opravilo.naziv',
      'ponavljajoce_opravilo.ponavljanje',
      'ponavljajoce_opravilo.trajanje',
      db.raw('UNIX_TIMESTAMP(ponavljajoce_opravilo.datum_dodajanja) as datum_dodajanja'),
      db.raw('UNIX_TIMESTAMP(ponavljajoce_opravilo.datum_zadnje_spremembe) as datum_zadnje_spremembe'),
      'ponavljajoce_opravilo.potrebno_stevilo',
      'ponavljajoce_opravilo.TK_seznam_odgovornih',
      db.raw('GROUP_CONCAT(prostor.naziv ORDER BY prostor.naziv SEPARATOR \', \') AS prostori'),
      db.raw('GROUP_CONCAT(registriran_uporabnik.username SEPARATOR \', \') AS odgovorne_osebe')
    ])
    .groupBy(
      'ponavljajoce_opravilo.id_ponavljajoce_opravilo',
      'ponavljajoce_opravilo.datum_zacetka',
      'ponavljajoce_opravilo.datum_konca',
      'ponavljajoce_opravilo.naziv',
      'ponavljajoce_opravilo.ponavljanje',
      'ponavljajoce_opravilo.trajanje',
      'ponavljajoce_opravilo.datum_dodajanja',
      'ponavljajoce_opravilo.datum_zadnje_spremembe',
      'ponavljajoce_opravilo.potrebno_stevilo',
      'ponavljajoce_opravilo.TK_seznam_odgovornih'
    );

    finishedRepeatingTasks = finishedRepeatingTasks.map(task => {
      task['responsibleUsers'] = [task['responsibleUsers']]
      return task;
    });
  

    const combinedTasks = finishedOnetimeTasks.concat(finishedRepeatingTasks);

    const sortedCombinedTasks = combinedTasks.sort((a, b) => {
      const dateA = new Date(a.datum_zadnje_spremembe);
      const dateB = new Date(b.datum_zadnje_spremembe);
      return dateB - dateA; // Sort newest to oldest
    });
    
    const limitedTasks = sortedCombinedTasks.slice(0, 5);    

    return res.status(200).json({ data: limitedTasks });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: ERROR500MSG });
  }

});


router.get('/units/:unit_id/tasks/repeating/current', authMiddleware, async (req, res) => {


  const { unit_id } = req.params;
  const user = req.user.user;
  const userID = user.id_registriran_uporabnik;
  const currentDate = new Date().toISOString().slice(0, 10);

  try {
    const unit = await db('bivalna_enota').where({ id_bivalna_enota: unit_id }).first();

    if (!unit) {
      return res.status(404).json({ msg: 'Enota ne obstaja' });
    }


    const isUserInUnit = await db('stanovalec')
      .where({ TK_registriran_uporabnik: userID, TK_bivalna_enota: unit_id })
      .first();

    if (!isUserInUnit) {
      return res.status(403).json({ msg: 'Uporabnik nima dostopa do te enote' });
    }

    let repeatingTasks = await db('ponavljajoce_opravilo')
        .join('prostor_veckratno', 'prostor_veckratno.TK_ponavljajoce_opravilo', 'ponavljajoce_opravilo.id_ponavljajoce_opravilo')
        .join('prostor', 'prostor_veckratno.TK_prostor', 'prostor.id_prostor')
        .join('seznam_odgovornih', 'ponavljajoce_opravilo.TK_seznam_odgovornih', 'seznam_odgovornih.id_seznam_odgovornih')
        .join('stanovalec', 'stanovalec.id_stanovalec', 'seznam_odgovornih.TK_stanovalec')
        .join('registriran_uporabnik', 'stanovalec.TK_registriran_uporabnik', 'registriran_uporabnik.id_registriran_uporabnik')
        .where('stanovalec.TK_bivalna_enota', unit_id)
        .andWhere('seznam_odgovornih.opravljeno', 0)
        .andWhere('ponavljajoce_opravilo.rok', '<=', 2)
        .select([
          'ponavljajoce_opravilo.id_ponavljajoce_opravilo',
          db.raw('UNIX_TIMESTAMP(ponavljajoce_opravilo.datum_zacetka) as datum_zacetka'),
          db.raw('UNIX_TIMESTAMP(ponavljajoce_opravilo.datum_konca) as datum_konca'),
          'ponavljajoce_opravilo.naziv',
          'ponavljajoce_opravilo.ponavljanje',
          'ponavljajoce_opravilo.trajanje',
          db.raw('UNIX_TIMESTAMP(ponavljajoce_opravilo.datum_dodajanja) as datum_dodajanja'),
          db.raw('UNIX_TIMESTAMP(ponavljajoce_opravilo.datum_zadnje_spremembe) as datum_zadnje_spremembe'),
          'ponavljajoce_opravilo.potrebno_stevilo',
          'ponavljajoce_opravilo.rok',
          'ponavljajoce_opravilo.TK_seznam_odgovornih',
          'prostor.naziv as prostor_naziv',
          'registriran_uporabnik.username as odgovorne_osebe'
        ]);


    
      const currentDateObj = new Date(currentDate);

      repeatingTasks = repeatingTasks.map(task => {
        const rokDays = parseInt(task['rok']);
        const rokDate = new Date(currentDateObj);

        rokDate.setDate(rokDate.getDate() + rokDays);

        task['odgovorne_osebe'] = [task['odgovorne_osebe']];
        task['rok'] = Math.floor(rokDate.getTime() / 1000);

        return task;
      });

      
    if(repeatingTasks){
      res.status(200).json({ data: repeatingTasks });
      console.log('sent: ' + JSON.stringify(repeatingTasks));
    } else {
      res.status(404).json({ msg: 'Nobeno ponavljajoce opravilo ni bilo najdeno.' });
    }


  } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: ERROR500MSG });
  }
});


/**
router.get('/units/:unit_id/tasks/:task_id/repeating/responsible', async (req, res) => {
  try {
    const { unit_id, task_id } = req.params;

    // Check if unit_id and task_id are valid integers
    if (isNaN(unit_id) || isNaN(task_id)) {
      return res.status(400).json({ message: 'Invalid unit_id or task_id.' });
    }

    // Query the database to get the current responsible user
    const responsibleUser1 = await db('registriran_uporabnik')
                        .join('stanovalec', 'stanovalec.TK_registriran_uporabnik', 'registriran_uporabnik.id_registriran_uporabnik')
                        .join('seznam_odgovornih', 'stanovalec.id_stanovalec', 'seznam_odgovornih.TK_stanovalec')
                        .join('enkratno_opravilo', 'stanovalec.id_stanovalec', 'enkratno_opravilo.TK_stanovalec')
                        .where('seznam_odgovornih.TK_ponavljajoce_opravilo', task_id)
                        .select('registriran_uporabnik.username');

    const responsibleUser = await db('seznam_odgovornih')
                              .join('stanovalec', 'stanovalec.id_stanovalec', 'seznam_odgovornih.TK_stanovalec')
                              .join('registriran_uporabnik', 'stanovalec.TK_registriran_uporabnik', 'registriran_uporabnik.id_registriran_uporabnik')
                              .where({ 'seznam_odgovornih.TK_ponavljajoce_opravilo': task_id })
                              .select('registriran_uporabnik.username')
                              .first();


    // If a responsible user is found, send it in the response
    if (responsibleUser) {
      res.status(200).json(responsibleUser);
    } else {
      res.status(404).json({ message: 'No responsible user found for the provided unit_id and task_id.' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
*/


module.exports = router;
