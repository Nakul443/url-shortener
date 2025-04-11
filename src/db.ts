import mysql, { Connection } from 'mysql2/promise';
// nomenclature
// mysql2/promise is a package


let connection: Connection | null = null;
// type of this can be either 'Connection (sql) or null'

async function getConnection(): Promise<Connection> {
  if (!connection) {
    try {
      connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'url_shortener'
      });
      console.log('Database connection established (on demand).');
    } catch (error) {
      console.error('Error creating database connection:', error);
      throw error; // Re-throw the error to be caught by the caller
    }
  }
  return connection; // if connection exists
}
  export default getConnection;// export default connection;