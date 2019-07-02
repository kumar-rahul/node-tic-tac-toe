// var createBoard = function() {};

let gameservice = {};
const add = (a, b) => a + b;

let sum = function(array) {
  return array.reduce(add);
};

let calculateWinner = function(squares) {
  // check for horizontal wins along rows and diagonals
  let winner = calculateWinnerInner(squares);
  if (winner !== 0) return winner;
  // check for possible vertical wins as well
  const stranspose = squares.map((col, i) => squares.map(row => row[i]));
  return calculateWinnerInner(stranspose);
};

let calculateWinnerInner = function(squares) {
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

let getAvailablePlaces = function(matrix) {
  let unplayedPlaces = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (matrix[i][j] === 0) {
        let index = i.toString() + "," + j.toString();
        unplayedPlaces.push(index);
      }
    }
  }
  return unplayedPlaces.join("|");
};

// let printSquare = function(matrix) {
//   for (let i = 0; i < 3; i++) {
//     for (let j = 0; j < 3; j++) {
//       console.log(matrix[i][j] + " ");
//     }
//     console.log("||");
//   }
// };

gameservice = {
  calculateWinner,
  getAvailablePlaces
};
module.exports = gameservice;
