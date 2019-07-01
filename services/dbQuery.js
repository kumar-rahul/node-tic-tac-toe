var commonService = require("../services/common");
var Promise = require("bluebird");

var query = {};
var gameBoard = null;

var createBoard = function(param) {
  var result = {};
  var uuid = commonService.generateUUID();
  var date = new Date();
  var createdAt = date.getTime();

  var dbQUery =
    "INSERT INTO `glapp`.`game` (`status`, `started`, `ended`, `user`, `winner`, `cells`, `gameid`) VALUES ('INPROGRESS', '" +
    createdAt +
    "', 'NA', '" +
    param.users +
    "', 'NA', '0,0|0,1|0,2|1,0|1,1|1,2|2,0|2,1|2,2', '" +
    uuid +
    "');";

  return new Promise(function(resolve, reject) {
    connection.query(dbQUery, function(error, results, fields) {
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

var getAllUserMove = function getAllUserMove() {
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

const add = (a, b) => a + b;

var sum = function(array) {
  return array.reduce(add);
};

var calculateWinner = function(squares) {
  // check for horizontal wins along rows and diagonals
  let winner = calculateWinnerInner(squares);
  if (winner !== 0) return winner;
  // check for possible vertical wins as well
  const stranspose = squares.map((col, i) => squares.map(row => row[i]));
  return calculateWinnerInner(stranspose);
};

var calculateWinnerInner = function(squares) {
  for (let r = 0; r < squares.length; r++) {
    if (squares[r].length === sum(squares[r])) {
      return 1;
    }
    if (squares[r].length === -sum(squares[r])) {
      return -1;
    }
  }
  const diagonal = squares.map((row, r) => squares[r][r]);

  if (squares[0].length === sum(diagonal)) {
    return 1;
  }
  if (squares[0].length === -sum(diagonal)) {
    return -1;
  }

  const len = squares.length;
  const crossdiagonal = squares.map((row, r) => squares[r][len - r - 1]);

  if (squares[0].length === sum(crossdiagonal)) {
    return 1;
  }
  if (squares[0].length === -sum(crossdiagonal)) {
    return -1;
  }

  return 0;
};

var statusCalculation = function() {
  var squares = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  return new Promise(function(resolve, reject) {
    getAllUserMove().then(
      function(response) {
        var resp = response.response;
        //   console.log("getAllUserMove | length:: ", resp.length);
        //   console.log("getAllUserMove | response:: ", response);
        //   console.log("getAllUserMove | response.response:: ", response.response);

        for (var k = 0, len = resp.length; k < len; k++) {
          var pos = resp[k] && resp[k].position.split(",");
          pos[0];
          // console.log("pos[0] = ", pos[0]);
          // console.log("pos[1] = ", pos[1]);
          // console.log("data = ", resp[k].data);
          pos[0] = parseInt(pos[0]);
          pos[1] = parseInt(pos[1]);
          squares[pos[0]][pos[1]] = parseInt(resp[k].data);
          // console.log("squares = ", squares[pos[0]][pos[1]]);
          // console.log("squares 0,2= ", squares[0][2]);
        }
        //   printSquare(squares);
        gameBoard = squares;
        resolve(calculateWinner(squares));
        //   console.log("calculateWinner::", calculateWinner(squares));
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

var printSquare = function(matrix) {
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      console.log(matrix[i][j] + " ");
    }
    console.log("||");
  }
};

var getAvailablePlaces = function(matrix) {
  var unplayedPlaces = [];
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      if (matrix[i][j] === 0) {
        unplayedPlaces.push(i.toString(), j.toString());
      }
    }
  }
  return unplayedPlaces.join("|");
};

var updateGameBoard = function(winner, gameId) {
  var date = new Date();
  var endedAt = date.getTime();
  var availablePlaces = getAvailablePlaces(gameBoard);
  console.log("availablePlaces:: ", availablePlaces);

  return new Promise(function(resolve, reject) {
    connection.query(
      "UPDATE `glapp`.`game` SET `status`='COMPLETED', `ended`='" +
        endedAt +
        "', `winner`='" +
        winner +
        "', `cells`='" +
        availablePlaces +
        "' WHERE `gameid`='" +
        gameId +
        "'",
      function(error, results, fields) {
        if (error) {
          console.log("Error | Game Board not updated");

          //   res.send(
          //     JSON.stringify({ status: 500, error: error, response: null })
          //   );
          //If there is error, we send the error in the error section with 500 status
        } else {
          console.log("Success | Game Board updated");
          //   res.send(
          //     JSON.stringify({ status: 200, error: null, response: results })
          //   );
          //If there is no error, all is good and response is 200OK.
        }
      }
    );
  });
};

var move = function(param) {
  var result = {};

  return new Promise(function(resolve, reject) {
    connection.query(
      "INSERT INTO `glapp`.`usermove` (`gameid`, `userid`, `data`, `position`) VALUES ('" +
        param.gameid +
        "', '" +
        param.userid +
        "', '" +
        param.data +
        "', '" +
        param.position +
        "')",
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
            function(value) {
              console.log("statusCalculation = ", value);
              if (value === 1) {
                console.log("statusCalculation if = ", value);
                updateGameBoard("U1", param.gameid).then(
                  function(response) {
                    console.log(
                      "statusCalculation | updateGameBoard = ",
                      response
                    );
                    result.message = "U1 Win";
                    resolve(result);
                  },
                  function(response) {
                    console.log("error | updateGameBoard U1 failed", response);
                    result = { status: 500, error: error, response: null };
                    reject(result);
                  }
                );
              } else if (value === -1) {
                console.log("statusCalculation if = ", value);
                updateGameBoard("U2", param.gameid).then(
                  function(response) {
                    console.log(
                      "statusCalculation | updateGameBoard = ",
                      response
                    );
                    result.message = "U2 Win";
                    resolve(result);
                  },
                  function(response) {
                    console.log("error | updateGameBoard U1 failed", response);
                    result = { status: 500, error: error, response: null };
                    reject(result);
                  }
                );
              } else {
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

query = {
  createBoard,
  move,
  getAllUserMove
};

module.exports = query;