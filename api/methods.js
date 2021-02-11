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

const insertEntries = async (entries, datetime) => {
  return new Promise(resolve => {
    // a for loop insert I realize can be bad/should be a recursive insert but that also means adding delay
    // the client side will limit the data inserted by date filtering
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      let error;

      pool.query(
        `INSERT INTO entries SET name = ?, calories = ?, gain = ?, datetime = ?`,
        [entry.name, entry.calories, entry.gain, datetime],
        (err, sqlRes) => {
          if (err) {
            console.log(err);
            error = true;
            resolve(false);
          } else {
            if (i === entries.length - 1) {
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

const suggestedFoodExists = async (suggestedFoodName) => {
  return new Promise(resolve => {
    pool.query(
      `SELECT id FROM suggested_foods WHERE name = ?`,
      [suggestedFoodName],
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

// datetime supplied but wrong format
const insertWeight = async (weightEntry, datetime) => {
  const { weight } = weightEntry;

  return new Promise(resolve => {
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