module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: 'rootie',
      database: 'Kdo_Danes_Pospravlja'
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};