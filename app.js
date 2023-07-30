const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;
const dbPath = path.join(__dirname, "cricketTeam.db");

let convertDBObject = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
    jerseyNumber: object.jersey_number,
    role: object.role,
  };
};

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server getting started");
    });
  } catch (e) {
    console.log(`Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBandServer();

app.get("/players/", async (request, response) => {
  const query = `
    SELECT * from cricket_team ORDER BY player_id;
    `;
  const playersArray = await db.all(query);
  const converted = playersArray.map((eachObj) => convertDBObject(eachObj));
  response.send(converted);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const sqlQuery = `
    INSERT INTO cricket_team (player_name,jersey_number,role)
    VALUES(
       '${playerName}',${jerseyNumber},'${role}'
    );
    `;
  const dbResponse = await db.run(sqlQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `
        SELECT * from cricket_team WHERE player_id = ${playerId};
    `;
  const dbResponse = await db.get(query);
  const converted = convertDBObject(dbResponse);
  response.send(converted);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const sqlQuery = `
        UPDATE
        cricket_team
        SET 
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
        WHERE
        player_id = ${playerId};
    `;
  const dbResponse = await db.run(sqlQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteBookQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  await db.run(deleteBookQuery);
  response.send("Player Removed");
});

module.exports = app;
