const express = require('express');
const router = express.Router();

const knex = require('knex');
const knexConfig = require('../knexfile').development;

const db = knex(knexConfig);
const ERROR500MSG = 'Napaka na strežniku. Poskusite kasneje.';

const updateResponsibleUserForRecurringTasks = async (taskId) => {
    try {
      const currentDate = new Date();
      const currentDateString = currentDate.toISOString().split('T')[0];
  
      let users = await db('seznam_odgovornih')
        .select('id_seznam_odgovornih', 'TK_stanovalec')
        .where('TK_ponavljajoce_opravilo', taskId)
        .orderBy('id_seznam_odgovornih');
    
      /*
      if (users.length === 0) {
        console.log('No responsible users found for this task.');
        return;
      }
      */
  
      let currentUserIndex = 0;
  
      for (const user of users) {
        let nextUserIndex = (currentUserIndex + 1) % users.length;

        if(!nextUserIndex){
          nextUserIndex = currentUserIndex;
        }
  
        const userExists = await db('stanovalec')
          .where('id_stanovalec', users[currentUserIndex].TK_stanovalec)
          .first();
        

        if (!userExists) {
          console.log(`User with ID ${users[currentUserIndex].TK_stanovalec} does not exist.`);
          continue;
        }
  
        await db('seznam_odgovornih')
          .where('id_seznam_odgovornih', users[currentUserIndex].id_seznam_odgovornih)
          .update({
            TK_stanovalec: users[nextUserIndex].TK_stanovalec,
            opravljeno: 0
          });
          console.log('Updated task ' + taskId);
  
        currentUserIndex = nextUserIndex;
      }
  
      await db('ponavljajoce_opravilo')
        .where('id_ponavljajoce_opravilo', taskId)
        .update('datum_zadnje_spremembe', currentDateString);
  
    } catch (error) {
      console.error('Error:', error);
    }
};
  
  

const updateRecurringTasks = async () => {
  try {
      const tasks = await db('ponavljajoce_opravilo')
          .select('id_ponavljajoce_opravilo', 'ponavljanje', 'datum_zacetka', 'datum_konca', 'datum_zadnje_spremembe', 'rok')
          .whereIn('ponavljanje', ['dnevno', 'tedensko', 'mesecno']);

      const currentDate = new Date();

      for (const task of tasks) {
          const { id_ponavljajoce_opravilo: taskId, ponavljanje: taskFrequency, datum_zacetka, datum_konca, datum_zadnje_spremembe, rok } = task;

          let interval;
          if (taskFrequency === 'dnevno') {
              interval = 1;
          } else if (taskFrequency === 'tedensko') {
              interval = 7;
          } else if (taskFrequency === 'mesecno') {
              interval = 30;
          }

          const startDate = new Date(datum_zacetka);
          const endDate = new Date(datum_konca);
          
          if (currentDate > endDate) {
              continue;
          }

          const timeDiff = Math.abs(currentDate - startDate);
          const daysSinceStart = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

          let remainingDays;
          
          if((daysSinceStart % interval) === 0){
            remainingDays = 0;

          }else {
            remainingDays = interval - (daysSinceStart % interval);
          }
            
          if (daysSinceStart % interval === 0) {
              await updateResponsibleUserForRecurringTasks(taskId);

              await db('ponavljajoce_opravilo')
                  .where('id_ponavljajoce_opravilo', taskId)
                  .update({
                    datum_zadnje_spremembe: currentDate.toISOString().split('T')[0],
                    rok: remainingDays
                  });

          } else {
            await db('ponavljajoce_opravilo')
                .where('id_ponavljajoce_opravilo', taskId)
                .update('rok', remainingDays);
          }
      }
  } catch (error) {
      console.error('Error:', error);
  }
};


const startRecurringTasksUpdate = () => {
    updateRecurringTasks();
    setInterval(() => {
        updateRecurringTasks();
    }, 24 * 60 * 60 * 1000);

    console.log('Recurring tasks update scheduled.');
};

module.exports = {startRecurringTasksUpdate, updateRecurringTasks};
