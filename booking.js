const express = require('express');
const bodyParser = require('body-parser');
const dbConnection = require('../config/database');
const asyncHandler = require('express-async-handler');

const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });
process.env.TZ = process.env.TIMEZONE;

const app = express();
const port = 3000;

// Use body-parser middleware to parse POST request data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Handle POST request to postData
app.post('/bookings/add', async (req, res) => {
  // const { id, numPeople, tableNum, startTime, endDate, customerId } = req.body;
  const bookingId = req.body.bookingId;
  const numPeople = req.body.numOfPeople;
  const tableNum = req.body.tableNumber;
  const date = req.body.date;
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const customerId = req.body.customerId;
  console.log('Received data:', { bookingId, numPeople, tableNum, date, startTime, endTime, customerId });
  var Values = [numPeople, tableNum, date, startTime, endTime, customerId];

  var sql2 = (`SELECT tableNumber,startTime,endTime FROM bookings WHERE date='${date}' And startTime < '${endTime}' And  endTime > '${startTime}' order by startTime;`)
  const [conflictingBookings] = await (await dbConnection).query(sql2);

  console.log(conflictingBookings);
  if (conflictingBookings.length === 0) {
    var sql = 'INSERT  INTO bookings (numberOfPeople,tableNumber,date,startTime,endTime,customerId) VALUES (?,?,?,?,?,?);'
    await (await dbConnection).query(sql, Values);
    res.status(200).send('Data received successfully!');
  } else {
    // res.status(400).send('The Time is Busy!');
    res.status(400).json(conflictingBookings);
  }

});

// Get Bookings By Date
app.post("/bookings/getByDate", async (req, res) => {
  const date = req.body.date;
  // console.log(date)
  var sql = (`SELECT tableNumber,startTime,endTime FROM bookings WHERE date='${date}'order by startTime;`);
  const [bookings] = await (await dbConnection).query(sql)
  // console.log(bookings)
  res.status(200).json(bookings)
})

// Get All Bookings
app.get("/bookings/getAll", async (req, res) => {
  var sql = (`SELECT * FROM bookings ORDER BY date,startTime;`);
  const [bookings] = await (await dbConnection).query(sql)
  res.status(200).json(bookings)
})

// Delete Booking By startTime,date,tableNumber and customer Id
app.post("/bookings/delete", async (req, res) => {
  const date = req.body.date;
  const startTime = req.body.startTime;
  const customerId = req.body.customerId;
  const tableNum = req.body.tableNumber;
  var sql = (`DELETE from bookings WHERE customerId=${customerId} AND startTime='${startTime}' AND date ='${date}' AND tableNumber=${tableNum};`)
  const [bookings] = await (await dbConnection).query(sql)
  // console.log(bookings)
  if (bookings.affectedRows === 0) {
    res.status(404).send("there is no bookings with the entered details")
  }
  else {
    res.status(200).json({ DeletedRows: bookings.affectedRows })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
