const commonService = require("../services/common");
const Promise = require("bluebird");
var gameService = require("../services/gameservice");

let query = {};
// let gameBoard = null;

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
        result = { status: 500, error: error, response: null };
        reject(result);
      } else {
        result = {
          status: 200,
          error: null,
          response: results
        };
        let matrix = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        gameService.setGameBoard(matrix);
        resolve(result);
      }
    });
  });
};

let getAllUserMove = function(gameid) {
  return new Promise(function(resolve, reject) {
    connection.query(
      "SELECT * FROM glapp.usermove where gameid=?",
      [gameid],
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
          resolve(result);
        }
      }
    );
  });
};

let statusCalculation = function(gameid) {
  // let squares = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  let squares = gameService.getGameBoard();
  return new Promise(function(resolve, reject) {
    getAllUserMove(gameid)
      .then(function(response) {
        let resp = response.response;
        let nextPlayerMove =
          resp.length < 2 ? "Opponent" : resp[resp.length - 2].userid;
        for (let k = 0, len = resp.length; k < len; k++) {
          let pos = resp[k] && resp[k].position.split(",");
          pos[0] = parseInt(pos[0]);
          pos[1] = parseInt(pos[1]);
          squares[pos[0]][pos[1]] = parseInt(resp[k].data);
        }
        //   printSquare(squares);
        // gameBoard = squares;
        gameService.setGameBoard(squares);
        let gameStatus = {
          status: gameService.calculateWinner(squares),
          user: nextPlayerMove
        };
        resolve(gameStatus);
        // },
        // function(response) {
        //   console.log(
        //     "statusCalculation| getAllUserMove query failed !!",
        //     response
        //   );
        //   reject(-2);
        // }
      })
      .catch(function(error) {
        console.log("statusCalculation| getAllUserMove: ", error);
        reject(-2);
      });
  });
};

let updateGameBoard = function(winner, gameId) {
  let date = new Date();
  let endedAt = date.getTime();
  let gameBoard = gameService.getGameBoard();
  let availablePlaces = gameService.getAvailablePlaces(gameBoard);
  let gameStatus = "COMPLETED";
  if (availablePlaces.length === 0) {
    gameStatus = "DRAW";
    availablePlaces = "NA";
  } else {
    availablePlaces = availablePlaces.join("|");
  }
  return new Promise(function(resolve, reject) {
    connection.query(
      "UPDATE glapp.game SET status=?, ended=?, winner=?, cells=? WHERE gameid=?",
      [gameStatus, endedAt, winner, availablePlaces, gameId],
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
    let validPos = gameService.validPosition(param.position);
    if (!validPos) {
      result = { status: 500, error: "Invalid Position", response: null };
      reject(result);
    } else {
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
            // game status calculation
            statusCalculation(param.gameid)
              .then(function(response) {
                let value = response.status;
                let nextPlayer = response.user;

                if (value === 1) {
                  updateGameBoard("U1", param.gameid).then(function(response) {
                    result.message = "U1 Win";
                    resolve(result);
                  });
                } else if (value === -1) {
                  updateGameBoard("U2", param.gameid).then(function(response) {
                    result.message = "U2 Win";
                    resolve(result);
                  });
                } else {
                  let gameBoard = gameService.getGameBoard();
                  let availablePlaces = gameService.getAvailablePlaces(
                    gameBoard
                  );
                  if (availablePlaces.length === 0) {
                    updateGameBoard("U1|U2", param.gameid).then(function(resp) {
                      result.message = "Draw";
                      resolve(result);
                    });
                  } else {
                    result.message = nextPlayer + " will play";
                    resolve(result);
                  }
                }
              })
              .catch(function(error) {
                console.log("move | statusCalculation: ", error);
                result = { status: 500, error: error, response: null };
                reject(result);
              });
          }
        }
      );
    }
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
