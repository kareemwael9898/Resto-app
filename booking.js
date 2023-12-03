const dbConnection = require('../config/database');
/* 
              APIs USED

        post ==> /api/booking/add
        post ==> /api/booking/getByDate
        get  ==> /api/booking/getAll
        post ==> /api/booking/getBusy
        post ==> /api/booking/delete
*/

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

  // Ensure that the time is in the range of open times
  if (startTime < '08:00' || endTime < '08:00') {
    console.log("Resto is open from 8:00 Am to 12:00 Am!");
    res.status(400).send("Resto is open from 8:00 Am to 12:00 Am!");
    return;
  }

  // Ensure that the end Time > start Time
  if (startTime > endTime) {
    console.log("The time entered is incorrect!");
    res.status(400).send("The time entered is incorrect!");
    return;
  }

  // Ensure that there isn't any bookings for this table at the chosen time
  var sql2 = (`SELECT tableNumber,startTime,endTime FROM bookings WHERE date='${date}' And tableNumber=${tableNum} And startTime < '${endTime}' And  endTime > '${startTime}' order by startTime;`)
  const [conflictingBookings] = await (await dbConnection).query(sql2);

  if (conflictingBookings.length === 0) {
    var sql = 'INSERT INTO bookings (bookingName,numberOfPeople,tableNumber,date,startTime,endTime,customerId) VALUES (?,?,?,?,?,?,?);'
    var Values = [bookingName, numPeople, tableNum, date, startTime, endTime, customerId];
    await (await dbConnection).query(sql, Values);
    res.status(200).send('Data received successfully!');
  } else {
    // res.status(400).send('The Table is Busy!');
    console.log("conflictingBookings : ", conflictingBookings);
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
  // console.log({deletedRows : bookings.affectedRows})
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