var express = require('express');
var router = express.Router();
const axios = require('axios');
require('dotenv').config();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Home' });
});
router.get('/about', function (req, res, next) {
  res.render('about', { title: 'About', layout: 'baseLayout' });
});
router.get('/hackerboard', function (req, res, next) {
  const url = process.env.CTFD_URL+'/scores';

  axios.get(url)
    .then(response => {
      const data = response.data;

      const newStandings = data.standings.map(entry => {
        const teamStats = {
          teamname: entry.team,
          score: entry.score,
          taskStats: []
        };

        for (const task in entry.taskStats) {
          if (entry.taskStats.hasOwnProperty(task)) {
            teamStats.taskStats.push({
              task: task,
              point: entry.taskStats[task].points,
              time: entry.taskStats[task].time
            });
          }
        }

        return teamStats;
      });

      const resultJson = {
        standings: newStandings
      };



      data.standings.forEach(entry => {
        const team = entry.team;

        // Reverse the taskStats for cumulative calculation
        const reversedTaskStats = Object.entries(entry.taskStats).reverse();

        let cumulativePoints = 0;
        const cumulativeTaskStats = [];

        reversedTaskStats.forEach(([taskName, taskData]) => {
          cumulativePoints += taskData.points;

          cumulativeTaskStats.push({
            x: new Date(taskData.time * 1000),
            y: cumulativePoints,
            teamname: team,
            task: taskName
          });
        });

        entry.cumulativeTaskStats = cumulativeTaskStats.reverse(); // Reverse back to original order
      });





      const taskStats = [];
      resultJson.standings.forEach(team => {

        let cumulativePoints = 0;

        for (const taskName in team.taskStats) {
          if (team.taskStats.hasOwnProperty(taskName)) {
            cumulativePoints += team.taskStats[taskName].point;

            taskStats.push({
              x: new Date(team.taskStats[taskName].time * 1000),
              y: cumulativePoints,
              teamname: team.teamname,

            });
          }
        }

        team.cumulativeTaskStats = taskStats;
      });
      var final = [];
      var result = [];


      result.push(taskStats);

      const transformedData = {};

      result.forEach(dataArray => {
        dataArray.forEach(data => {
          const { x, y, teamname } = data;
          if (!transformedData[teamname]) {
            transformedData[teamname] = [];
          }
          transformedData[teamname].push({ x, y, teamname });
        });
      });
      var last = []
      final = JSON.stringify(transformedData, null, 2)

      var parsedData = JSON.parse(final);
      // var jsondata = JSON.parse(dat) 
      // console.log(final)
      // console.log(dat)

      for (const team in parsedData) {
        if (parsedData.hasOwnProperty(team)) {
          parsedData[team] = parsedData[team].reverse(); // Reverse the order of the team's data
        }
      }

      var hello = data.standings.map(entry => { return entry })


      const { spawn } = require('child_process');
      // console.log(hello);
      const inputData = {
        "standings": [hello]
      };

      const pythonProcess = spawn('python3', ['sort.py'], {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'] // Add this line for inter-process communication
      });

      pythonProcess.stdin.write(JSON.stringify(inputData));
      pythonProcess.stdin.end();

      pythonProcess.on('message', (message) => {
        // Process the received message (the processed data)
        console.log('Received processed data:');
        console.log(JSON.parse(message));
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python script error: ${data}`);
      });
      pythonProcess.stdout.on('data', (data) => {
        s = JSON.parse(data.toString())
        s = s['standings'][0]
        for (const entry of s) {
          let totalScore = 0;
          for (const stat of entry.sortedTaskStats) {
            totalScore += stat.points;
            stat.totalScore = totalScore;
          }
        }

        console.log(s[0].sortedTaskStats);
        res.render('scoreboard', { title: 'Hackerboard', layout: 'baseLayout', jsonData: s });

      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Python script execution completed successfully.');
        } else {
          console.error('Python script encountered an error.');
        }
      });

    })
    .catch(error => {
      console.error('Error fetching data:', error);
      res.status(500).send('Error fetching data');
    });
});
router.get('/score', function (req, res, next) {


  const url = 'http://44.211.138.118:4000/scores';

  axios.get(url)
    .then(response => {
      const data = response.data;

      const newStandings = data.standings.map(entry => {
        const teamStats = {
          teamname: entry.team,
          taskStats: []
        };

        for (const task in entry.taskStats) {
          if (entry.taskStats.hasOwnProperty(task)) {
            teamStats.taskStats.push({
              task: task,
              point: entry.taskStats[task].points,
              time: entry.taskStats[task].time
            });
          }
        }

        return teamStats;
      });

      const resultJson = {
        standings: newStandings
      };

      res.send(resultJson);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });

})

router.get('/challenge', function (req, res, next) {
  const headers = {
    'Authorization': 'Token ' + process.env.API_TOKEN,
    'Content-Type': 'application/json'
  };

  axios.get(process.env.API_URL + '/challenges', { headers })
    .then(response => {
      console.log('Response:', response.data);
      res.render('challengePage', { title: 'Challenge', layout: 'baseLayout', challengeData: response.data.data });

    })
    .catch(error => {
      console.error('Error:', error);
    });

});


router.get('/register', function (req, res, next) {

  res.render('register', { title: 'Register', layout: 'baseLayout' });


});
router.post('/login', function (req, res, next) {
  const headers = {
    'Authorization': 'Token ' + process.env.API_TOKEN,
    'Content-Type': 'application/json'
  };
  axios.get(process.env.API_URL + '/users', { headers })
    .then(response => {
      // check every response.data.data for username and password
      // if username and password match, redirect to hackerboard
      // else redirect to login
      var username = req.body.username;
      var password = req.body.password;
      var flag = 0;
      for (var i = 0; i < response.data.data.length; i++) {
        if (response.data.data[i].name == username) {
          axios.get(process.env.API_URL + '/users/' + response.data.data[i].id, { headers }).then(newres => {
           console.log('Response:', newres.data);
          
          })
        }
      }
      if (flag == 1) {
        res.redirect('/hackerboard');
      }
      else {
        res.redirect('/login');
      }
    })
  });

router.get('/login', function (req, res, next) {
  
    res.render('login', { title: 'Login', layout: 'baseLayout' });
})

router.post('/register', function (req, res, next) {
  const headers = {
    'Authorization': 'Token ' + process.env.API_TOKEN,
    'Content-Type': 'application/json'
  };
  axios.post(process.env.API_URL + '/users', {
    name: req.body.username,
    password: req.body.password,
    email: req.body.email
  }, { headers })
    .then(response => {
      console.log('Response:', response.data);
    })
});
module.exports = router;
