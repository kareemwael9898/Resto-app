const dbConnection = require('../config/database');

// Handle POST request to postData
const add = async (req, res) => {
  const bookingName = req.body.bookingName;
  const numPeople = req.body.numOfPeople;
  const tableNum = req.body.tableNumber;
  const date = req.body.date;
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const customerId = req.body.customerId;
  console.log('Received data:', { bookingName, numPeople, tableNum, date, startTime, endTime, customerId });
  
  var sql2 = (`SELECT tableNumber,startTime,endTime FROM bookings WHERE date='${date}' And tableNumber=${tableNum} And startTime < '${endTime}' And  endTime > '${startTime}' order by startTime;`)
  const [conflictingBookings] = await (await dbConnection).query(sql2);
  
  console.log(conflictingBookings);
  if (conflictingBookings.length === 0) {
    var sql = 'INSERT INTO bookings (bookingName,numberOfPeople,tableNumber,date,startTime,endTime,customerId) VALUES (?,?,?,?,?,?,?);'
    var Values = [bookingName, numPeople, tableNum, date, startTime, endTime, customerId];
    await (await dbConnection).query(sql, Values);
    res.status(200).send('Data received successfully!');
  } else {
    // res.status(400).send('The Table is Busy!');
    res.status(400).json(conflictingBookings);
  }
  
};

// Get Bookings By Date
const getByDate = async (req, res) => {
  const date = req.body.date;
  // console.log(date)
  var sql = (`SELECT tableNumber,startTime,endTime FROM bookings WHERE date='${date}'order by startTime;`);
  const [bookings] = await (await dbConnection).query(sql)
  // console.log(bookings)
  res.status(200).json(bookings)
};

// Get All Bookings
const getAll = async (req, res) => {
  var sql = (`SELECT * FROM bookings ORDER BY date,startTime;`);
  const [bookings] = await (await dbConnection).query(sql)
  res.status(200).json(bookings)
};

// Get Busy Tables By Date And Time
const getBusy = async (req, res) => {
  const date = req.body.date;
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  var sql = (`SELECT tableNumber,startTime,endTime FROM bookings WHERE date='${date}' And startTime < '${endTime}' And  endTime > '${startTime}' order by startTime;`);
  const [busyTables] = await (await dbConnection).query(sql)
  res.status(200).json(busyTables)
};

// Delete Booking By startTime,date,tableNumber and customer Id
const deleteBooking = async (req, res) => {
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
};

module.exports = {
  add,
  getByDate,
  getAll,
  getBusy,
  deleteBooking
}