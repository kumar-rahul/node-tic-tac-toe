const commonService = require("../services/common");
const Promise = require("bluebird");
var gameService = require("../services/gameservice");

let query = {};
let gameBoard = null;

let createBoard = function(param) {
  let result = {};
  let uuid = commonService.generateUUID();
  let date = new Date();
  let createdAt = date.getTime();

  let dbQUery =
    "INSERT INTO glapp.game (status, started, ended, user, winner, cells, gameid) VALUES (?, ?, ?, ?, ?, ?, ?)";
  let values = [
    "INPROGRESS",
    createdAt,
    "NA",
    param.users,
    "NA",
    "0,0|0,1|0,2|1,0|1,1|1,2|2,0|2,1|2,2",
    uuid
  ];

  return new Promise(function(resolve, reject) {
    connection.query(dbQUery, values, function(error, results, fields) {
      if (error) {
        //If there is error, we send the error in the error section with 500 status
        result = { status: 500, error: error, response: null };
        reject(result);
      } else {
        //If there is no error, all is good and response is 200OK.
        result = {
          status: 200,
          error: null,
          response: results
        };
        resolve(result);
      }
    });
  });
};

let getAllUserMove = function getAllUserMove() {
  return new Promise(function(resolve, reject) {
    connection.query("SELECT * FROM glapp.usermove;", function(
      error,
      results,
      fields
    ) {
      if (error) {
        result = { status: 500, error: error, response: null };
        reject(result);
      } else {
        result = {
          status: 200,
          error: null,
          response: results
        };
        resolve(result);
      }
    });
  });
};

let statusCalculation = function() {
  let squares = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  return new Promise(function(resolve, reject) {
    getAllUserMove().then(
      function(response) {
        let resp = response.response;
        let nextPlayerMove = resp[resp.length - 2].userid;
        for (let k = 0, len = resp.length; k < len; k++) {
          let pos = resp[k] && resp[k].position.split(",");
          pos[0] = parseInt(pos[0]);
          pos[1] = parseInt(pos[1]);
          squares[pos[0]][pos[1]] = parseInt(resp[k].data);
        }
        //   printSquare(squares);
        gameBoard = squares;
        let gameStatus = {
          status: gameService.calculateWinner(squares),
          user: nextPlayerMove
        };
        resolve(gameStatus);
      },
      function(response) {
        console.log(
          "statusCalculation| getAllUserMove query failed !!",
          response
        );
        reject(-2);
      }
    );
  });
};

let updateGameBoard = function(winner, gameId) {
  let date = new Date();
  let endedAt = date.getTime();
  let availablePlaces = gameService.getAvailablePlaces(gameBoard);

  return new Promise(function(resolve, reject) {
    connection.query(
      "UPDATE glapp.game SET status=?, ended=?, winner=?, cells=? WHERE gameid=?",
      ["COMPLETED", endedAt, winner, availablePlaces, gameId],
      function(error, results, fields) {
        if (error) {
          result = {
            status: 500,
            error: null,
            response: results
          };
          result = { status: 500, error: error, response: null };
          reject(result);
        } else {
          result = {
            status: 200,
            error: null,
            response: results
          };
          resolve(result);
        }
      }
    );
  });
};

let move = function(param) {
  let result = {};

  return new Promise(function(resolve, reject) {
    connection.query(
      "INSERT INTO usermove (gameid, userid, data, position) VALUES (?, ?, ?, ?)",
      [param.gameid, param.userid, param.data, param.position],
      function(error, results, fields) {
        if (error) {
          result = { status: 500, error: error, response: null };
          reject(result);
        } else {
          result = {
            status: 200,
            error: null,
            response: results
          };

          statusCalculation().then(
            function(response) {
              let value = response.status;
              let nextPlayer = response.user;

              if (value === 1) {
                updateGameBoard("U1", param.gameid).then(
                  function(response) {
                    result.message = "U1 Win";
                    resolve(result);
                  },
                  function(err) {
                    result = { status: 500, error: error, response: err };
                    reject(result);
                  }
                );
              } else if (value === -1) {
                updateGameBoard("U2", param.gameid).then(
                  function(response) {
                    result.message = "U2 Win";
                    resolve(result);
                  },
                  function(response) {
                    result = { status: 500, error: error, response: null };
                    reject(result);
                  }
                );
              } else {
                result.message = nextPlayer + " will play";
                resolve(result);
              }
            },
            function(response) {
              console.log("statusCalculation | error", response);
            }
          );
        }
      }
    );
  });
};

let checkGameStatus = function(param) {
  let result = {};

  return new Promise(function(resolve, reject) {
    connection.query(
      "SELECT * FROM glapp.game where gameid=?",
      [param.gameid],
      function(error, results, fields) {
        if (error) {
          result = { status: 500, error: error, response: null };
          reject(result);
        } else {
          var response = results[0];
          if (response.status === "INPROGRESS") {
            resolve(param);
          } else if (
            response.status === "COMPLETED" ||
            response.status === "DRAW" ||
            response.status === "TIMEOUT"
          ) {
            result = {
              status: 200,
              error: null,
              response: response,
              message: "Game status " + response.status
            };
            reject(result);
          }
        }
      },
      function(response) {
        console.log("checkGameStatus | error", response);
      }
    );
  });
};

query = {
  createBoard,
  move,
  checkGameStatus
};

module.exports = query;
