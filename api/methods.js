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

const insertEntries = async (entries) => {
  return new Promise(resolve => {
    // a for loop insert I realize can be bad/should be a recursive insert but that also means adding delay
    // the client side will limit the data inserted by date filtering
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      pool.query(
        `INSERT INTO entries SET name = ?, calories = ?, gain = ?, datetime = ?`,
        [entry.name, entry.calories, entry.gain, formatDate()],
        (err, sqlRes) => {
          if (err) {
            resolve(false);
            break;
          } else {
            if (i === entries.length - 1) {
              resolve(true);
            }
          }
        }
      );
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
          break;
        } else {
          if (sqlRes) {
            resolve(true);
          }
        }
      }
    );
  });
}

const insertSuggestedFoods = async (suggestedFoods) => {
  return new Promise(resolve => {
    // a for loop insert I realize can be bad/should be a recursive insert but that also means adding delay
    // the client side will limit the data inserted by date filtering
    for (let i = 0; i < suggestedFoods.length; i++) {
      const suggestedFood = suggestedFoods[i];

      if (await suggestedFoodExists(suggestedFood.name)) {
        continue;
      }

      pool.query(
        `INSERT INTO suggested_foods SET name = ?, calories = ?`,
        [suggestedFood.name, suggestedFood.calories],
        (err, sqlRes) => {
          if (err) {
            resolve(false);
            break;
          } else {
            if (i === suggestedFoods.length - 1) {
              resolve(true);
            }
          }
        }
      );
    }
  });
}

const insertWeight = async(weight) => {

}

const syncData = async (req, res) => {
  const { entries, suggestedFoods, weight } = req.body;

  // entries/weight expected to be filled, suggestedFoods may be empty/unchanged
  if (!entries || !weight) {
    res.status(400).send('invalid data');
  }

  const entriesInserted = await insertEntries(entries);
  const suggestedFoodsInserted = !suggestedFoods.length ? true : await insertSuggestedFoods(suggestedFoods);
  const weightInserted = await insertWeight(weight);

  if (!entriesInserted || !suggestedFoodsInserted || !weightsInserted) {
    res.status(400).send('failed to insert');
  }
  
  res.status(204).send('success');
}

module.exports = {
  syncData
}