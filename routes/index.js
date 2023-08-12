var express = require('express');
var router = express.Router();
const axios = require('axios');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Home' });
});
router.get('/about', function (req, res, next) {
  res.render('about', { title: 'About', layout: 'baseLayout' });
});
router.get('/hackerboard', function (req, res, next) {
  const url = 'http://44.211.138.118:4000/scores';

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
      var hello2 = data.standings.map(entry => { return entry }) 
      console.log(hello);
      // Now parsedData contains the sorted inner data for each team
      res.render('scoreboard', { title: 'Hackerboard', layout: 'baseLayout', jsonData: hello});
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
module.exports = router;
