var express = require("express");
var router = express.Router();
var commonService = require("../services/common");
var dbQuery = require("../services/dbQuery");

router.post("/createGameBoard", function(req, res, next) {
  dbQuery.createBoard(req.body).then(
    function(response) {
      res.send(response);
    },
    function(response) {
      res.send(response);
    }
  );
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

router.put("/updateBoard", function(req, res, next) {
  connection.query(
    "UPDATE `glapp`.`game` SET `status`='completed', `ended`='29-06-2020', `user`='u1,u3', `winner`='NA', `cells`='1,2,3,4,5,6,7,8,9' WHERE `id`='2'",
    function(error, results, fields) {
      if (error) {
        res.send(JSON.stringify({ status: 500, error: error, response: null }));
        //If there is error, we send the error in the error section with 500 status
      } else {
        res.send(
          JSON.stringify({ status: 200, error: null, response: results })
        );
        //If there is no error, all is good and response is 200OK.
      }
    }
  );
});

router.post("/usermove", function(req, res, next) {
  //   dbQuery.getAllUserMove().then(
  dbQuery.move(req.body).then(
    function(response) {
      res.send(response);
    },
    function(response) {
      res.send(response);
    }
  );
});

module.exports = router;
