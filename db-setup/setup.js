import mysql from "mysql";

function main() {
  console.log(process.env.MYSQL_WRITE_HOST);
  console.log(process.env.MYSQL_USER);
  console.log(process.env.MYSQL_PASSWORD);
  const connection = mysql.createConnection({
    host: process.env.MYSQL_WRITE_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: 3306,
  });

  connection.connect((err) => {
    if (err) {
      console.error("Error connecting: " + err.stack);
      return;
    }

    console.log("Connected on thread " + connection.threadId);
  });
  connection.query(
    "CREATE DATABASE IF NOT EXISTS inrix_aws",
    function (err, result) {
      if (err) throw err;
      console.log("Database created");
    }
  );

  connection.query("USE inrix_aws", function (err, result) {
    if (err) throw err;
    console.log("Using inrix_aws database");
  });

  connection.query(
    "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), default_photo_url VARCHAR(255));",
    function (err, result) {
      if (err) throw err;
      console.log("Table created");
    }
  );

  connection.query(
    "CREATE TABLE IF NOT EXISTS user_groups (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), description VARCHAR(255) );",
    function (err, result) {
      if (err) throw err;
      console.log("Table created");
    }
  );

  // Create events table--id, name, group_id, description, date, time, location, photoUrl, creator_id
  connection.query(
    "CREATE TABLE IF NOT EXISTS events (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), group_id INT, description VARCHAR(255), date TIMESTAMP, location VARCHAR(255), photoUrl VARCHAR(255), creator_id INT);",
    function (err, result) {
      if (err) throw err;
      console.log("Table created");
    }
  );

  // Create event_photos table--id, event_id, photo_id
  connection.query(
    "CREATE TABLE IF NOT EXISTS event_photos (id INT AUTO_INCREMENT PRIMARY KEY, event_id INT, photo_id INT);",
    function (err, result) {
      if (err) throw err;
      console.log("Table created");
    }
  );

  // create photos table--id, photoUrl
  connection.query(
    "CREATE TABLE IF NOT EXISTS photos (id INT AUTO_INCREMENT PRIMARY KEY, photo_url VARCHAR(255));",
    function (err, result) {
      if (err) throw err;
      console.log("Table created");
    }
  );

  // Create photo_people table--id, photo_id, face_id
  connection.query(
    "CREATE TABLE IF NOT EXISTS photo_people (id INT AUTO_INCREMENT PRIMARY KEY, photo_id INT, face_id INT);",
    function (err, result) {
      if (err) throw err;
      console.log("Table created");
    }
  );

  // Create event_attendees table--id, event_id, user_id
  connection.query(
    "CREATE TABLE IF NOT EXISTS event_attendees (id INT AUTO_INCREMENT PRIMARY KEY, event_id INT, user_id INT);",
    function (err, result) {
      if (err) throw err;
      console.log("Table created");
    }
  );

  // Create user_groups table--id, user_id, group_id
  connection.query(
    "CREATE TABLE IF NOT EXISTS user_groups (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, group_id INT);",
    function (err, result) {
      if (err) throw err;
      console.log("Table created");
    }
  );

  // Create faces table--id, user_id
  connection.query(
    "CREATE TABLE IF NOT EXISTS faces (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT DEFAULT NULL);",
    function (err, result) {
      if (err) throw err;
      console.log("Table created");
    }
  )
}

main();