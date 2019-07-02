const express = require("express");
const router = express.Router();
const gameDbQuery = require("../models/gameDbQuery");
var gameService = require("../services/gameservice");

router.post("/createGameBoard", function(req, res, next) {
  gameDbQuery
    .createBoard(req.body)
    .then(function(response) {
      res.send(response);
    })
    .catch(function(error) {
      console.log("createGameBoard | catch error", error);
      //   res.send(error);
    });
});

router.post("/usermove", function(req, res, next) {
  //   let validPos = gameService.validPosition(req.body.position);

  gameDbQuery
    .checkGameStatus(req.body)
    .then(gameDbQuery.move)
    .then(function(response) {
      res.send(response);
    })
    .catch(function(error) {
      console.log("usermove | catch error", error);
      res.send(error);
    });
});

router.get("/showBoard", function(req, res, next) {
  connection.query("SELECT * from glapp.game", function(
    error,
    results,
    fields
  ) {
    if (error) {
      res.send(JSON.stringify({ status: 500, error: error, response: null }));
      //If there is error, we send the error in the error section with 500 status
    } else {
      res.send(JSON.stringify({ status: 200, error: null, response: results }));
      //If there is no error, all is good and response is 200OK.
    }
  });
});

module.exports = router;
