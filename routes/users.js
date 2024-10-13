var express = require('express');
let appInsightsClient = require("applicationinsights").defaultClient;
let usersData = require("../data/users");
var router = express.Router();

/* GET users listing. */
router.get('/', getUsers);
function getUsers(req, res, next) {
  appInsightsClient.trackEvent({ name: "Users list requested" });

  const users = Object.values(usersData);
  appInsightsClient.trackMetric({ name: "UsersFetched", value: users.length });
  res.send(users);
}

router.get('/:userId', handleGetUserById);
function handleGetUserById(req, res, next) {
  const { userId } = req.params;
  if (!(Number.isInteger(Number(userId)) && parseInt(userId) > 0)) {
    const exception = new Error(`Invalid inputs: ${JSON.stringify({userId})}`);
    appInsightsClient.trackException({
      exception,
      severity: 'Error',
      properties: { requestedUserId: userId }
    });

    return res.sendStatus(400);
  }

  const user = usersData[userId];
  if (!user) {
    const exception = new Error(`No user found with ID ${userId}`);
    appInsightsClient.trackException({
      exception,
      severity: 'Error',
      properties: { requestedUserId: userId }
    });

    return res.sendStatus(404);
  }

  appInsightsClient.trackEvent({ name: "UserFetched", properties: { userId }});
  res.send(user);
}

module.exports = router;
