const { pool } = require('./dbConnect');

// straight outta SO
// https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd
const formatDate = () => {
  var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

// there is a possiblity of datetime overlap since the frontend UI derives its own time and the server side has its own time
// client side could pass it to server side
const entryExists = async (todaysDate) => {
  return new Promise(resolve => {
    pool.query(
      `SELECT id FROM entries WHERE datetime = ?`,
      [todaysDate],
      (err, sqlRes) => {
        if (err) {
          resolve(false);
        } else {
          if (sqlRes.length) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      }
    );
  });
}

const insertEntries = async (entries, datetime) => {
  const todaysDate = formatDate();
  const entryForTodayExists = await entryExists(todaysDate);

  return new Promise(resolve => {
    // ooh fancy, no this is actually bad
    pool.query(
      `${entryForTodayExists
        ? 'UPDATE entries SET todays_calories = ? WHERE datetime = ?'
        : 'INSERT INTO entries SET todays_calories= ?, datetime = ?'}`,
        [JSON.stringify(entries), todaysDate],
      (err, sqlRes) => {
        if (err) {
          console.log(err);
          error = true;
          resolve(false);
        } else {
          resolve(true);
        }
      }
    );
  });
}

const suggestedFoodExists = async (suggestedFoodName) => {
  return new Promise(resolve => {
    pool.query(
      `SELECT id FROM suggested_foods WHERE name = ?`,
      [suggestedFoodName],
      (err, sqlRes) => {
        if (err) {
          resolve(false);
        } else {
          resolve(sqlRes.length);
        }
      }
    );
  });
}

const insertSuggestedFoods = async (suggestedFoods) => {
  return new Promise(async (resolve) => {
    // a for loop insert I realize can be bad/should be a recursive insert but that also means adding delay
    // the client side will limit the data inserted by date filtering
    for (let i = 0; i < suggestedFoods.length; i++) {
      const suggestedFood = suggestedFoods[i];
      const dontSave = await suggestedFoodExists(suggestedFood.name); // lol
      let error;

      if (dontSave) {
        if (i === suggestedFoods.length - 1) { // nasty
          resolve(true);
        }
        continue;
      }

      pool.query(
        `INSERT INTO suggested_foods SET name = ?, calories = ?, datetime = ?`,
        [suggestedFood.name, suggestedFood.calories, suggestedFood.datetime],
        (err, sqlRes) => {
          if (err) {
            console.log(err);
            error = true;
            resolve(false);
          } else {
            if (i === suggestedFoods.length - 1) {
              resolve(true);
            }
          }
        }
      );

      if (error) {
        break;
      }
    }
  });
}

const checkDailyWeightSet = async () => {
  return new Promise(resolve => {
    pool.query(
      `SELECT id FROM weight WHERE datetime = ?`,
      [formatDate()],
      (err, sqlRes) => {
        if (err) {
          console.log(err);
          resolve(false);
        } else {
          resolve(sqlRes.length);
        }
      }
    );
  });
}

// datetime supplied but wrong format
const insertWeight = async (weightEntry, datetime) => {
  const { weight } = weightEntry;
  const weightSet = await checkDailyWeightSet();

  return new Promise(resolve => {
    if (weightSet) {
      resolve(true);
    }

    pool.query(
      `INSERT INTO weight SET weight = ?, datetime = ?`,
      [weight, formatDate()],
      (err, sqlRes) => {
        if (err) {
          console.log(err);
          resolve(false);
        } else {
          resolve(true);
        }
      }
    );
  });
}

const uploadData = async (req, res) => {
  const { entries, suggestedFoods, weight } = req.body;

  // entries/weight expected to be filled, suggestedFoods may be empty/unchanged
  if (!req.body || !entries?.length || !weight?.length) {
    res.status(400).send('invalid data');
    return;
  }

  const datetime = formatDate();
  const entriesInserted = await insertEntries(entries, datetime);
  const suggestedFoodsInserted = !suggestedFoods.length ? true : await insertSuggestedFoods(suggestedFoods);
  const weightInserted = await insertWeight(weight[0], datetime);

  if (!entriesInserted || !suggestedFoodsInserted || !weightInserted) {
    res.status(400).send('failed to insert');
    return;
  }
  
  res.status(204).send('success');
}

module.exports = {
  uploadData
}