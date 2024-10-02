const sendEmail = require('./emailSender-nodemailer');
const express = require('express');
const router = express.Router();

const knex = require('knex');
const knexConfig = require('../knexfile').development;

const db = knex(knexConfig);
const ERROR500MSG = 'Napaka na strežniku. Poskusite kasneje.';


const checkAndSendEmails = async () => {
    //console.log('checkAndSendEmails function triggered');
    try {
      const today = new Date().toISOString().split('T')[0];
  
      const results = await db('seznam_odgovornih')
        .join('stanovalec', 'seznam_odgovornih.TK_stanovalec', '=', 'stanovalec.id_stanovalec')
        .join('registriran_uporabnik', 'stanovalec.TK_registriran_uporabnik', '=', 'registriran_uporabnik.id_registriran_uporabnik')
        .join('bivalna_enota', 'stanovalec.TK_bivalna_enota', '=', 'bivalna_enota.id_bivalna_enota')
        .join('ponavljajoce_opravilo', 'ponavljajoce_opravilo.TK_seznam_odgovornih', '=', 'seznam_odgovornih.id_seznam_odgovornih')
        .select(
          'registriran_uporabnik.email',
          'registriran_uporabnik.ime_priimek',
          'bivalna_enota.naziv as naziv_enote',
          "ponavljajoce_opravilo.naziv as opravilo",
          'seznam_odgovornih.datum',
          'seznam_odgovornih.opravljeno',
        )
        .where('seznam_odgovornih.opravljeno', '=', false)
        .andWhere('seznam_odgovornih.datum', '=', today);
  
        //console.log('Query results:', results);
  
      for (const row of results) {
        const { email, ime_priimek, naziv_enote, opravilo } = row;
        //console.log("naziv enote", naziv_enote); 
        await sendEmail(email, opravilo, ime_priimek, naziv_enote);
        console.log(`Email sent to ${email} for task ${opravilo}`);
      }
    } catch (error) {
      console.error('Error querying database and sending emails:', error);
    }
  };

  module.exports = checkAndSendEmails;