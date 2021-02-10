  
import React, { useEffect, useState, useRef } from 'react';
import './../../misc/styles/layout.scss';
import './BasicInterface.scss';
import { getDateTime } from './../../misc/js/utilities.js';
import closeIcon from './../../misc/icons/close-icon__chocolate.svg';
import Dexie from 'dexie';

const BasicInterface = () => {
  const [db, setDb] = useState(null);
  const [entries, setEntries] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [activeEntryModified, setActiveEntryModified] = useState(false);
  const [weight, setWeight] = useState(0);
  const [weightInput, setWeightInput] = useState(0);
  const [showWeightPrompt, setShowWeightPrompt] = useState(false); // nasty three states
  const [suggestedFoods, setSuggestedFoods] = useState([]);
  const [suggestedFood, setSuggestedFood] = useState({});
  
  // inputs
  const entryName = useRef(null);
  const entryAmount = useRef(null);
  const calorieAddBtn = useRef(null);

  const getToday = () => {
    const intDayMap = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];
    const date = new Date();
    const dayInt = date.getDay();

    return intDayMap[dayInt];
  }

  const sumCalories = () => {
    let calories = 0;
    entries.forEach((entry) => {
      calories += parseInt(entry.calories);
    });
    
    return calories;
  }

  const clearInputs = () => {
    entryName.current.value = '';
    entryAmount.current.value = '';
  }

  const addCalories = () => {
    calorieAddBtn.current.removeAttribute( 'disabled' );

    if (!db) {
      alert('Database not created');
      return false;
    }

    // check fields not empty
    if (!entryName.current.value || !entryAmount.current.value) {
      alert('Please make sure both fields are filled in');
      return false;
    }

    db.entries.add({
        name: entryName.current.value, 
        calories: entryAmount.current.value,
        gain: true,
        datetime: getDateTime("MM-DD-YYYY")
    }).then(() => {
      clearInputs();
      getTodaysData(db);
    }).catch((err) => {
      console.log(err);
      alert('Failed to save');
    }).finally(() => {
      calorieAddBtn.current.removeAttribute( 'disabled' );
    });
  }

  /**
   * 
   * @param {object} entry - the calorie source 
   */
  const togglePopup = (entry) => {
    setActiveEntry(entry);
  }

  const getTodaysData = (db) => {
    const todaysDate = getDateTime("MM-DD-YYYY");
    db.entries.where("datetime").equals(todaysDate).toArray().then((entries) => { // ehh not a datetime operation probably faster than string comp
      setEntries(entries);
    });
  }

  const entryRows = (() => {
    return entries.map((entry, index) => (
      <div key={ index } onClick={ () => togglePopup(entry) } className="basic-interface__entry flex-wrap-center-left">
        <span className="entry__name">{ entry.name }</span>
        <span className="entry__calories">{ (entry.gain ? '+' : '-') + entry.calories }c</span>
      </div>
    ));
  })();

  const closeEntryPopup = () => {
    setActiveEntry(null);
  }

  const saveActiveEntryChanges = (entryId) => {
    if (!db) {
      alert('Database not created');
      return false;
    }

    db.entries.where("id").equals(entryId).modify({
      name: activeEntry.name,
      calories: activeEntry.calories
    }).then(() => {
      closeEntryPopup();
      getTodaysData(db);
    })
    .catch(e => {
      console.log('failed to update entry', e);
      alert('failed to update entry');
    });
  }

  const popupInputHandler = (inputName, value, setByPopup) => {
    if (inputName === "name") {
      setActiveEntry((prev) => ({
        ...prev,
        name: value
      }));
    } else {
      setActiveEntry((prev) => ({
        ...prev,
        calories: value
      }));
    }

    if (setByPopup && !activeEntryModified) {
      setActiveEntryModified(true);
    }
  }
  
  const deleteEntry = (entryId) => {
    if (!db) {
      alert("Database doesn't exist");
      return false;
    }

    const dbEntry = db.entries.where("id").equals(entryId);

    if (dbEntry) {
      dbEntry.delete()
        .then(() => {
          alert('Entry deleted');
          closeEntryPopup();
          getTodaysData(db);
        })
        .catch((err) => {
          alert('Failed to delete owner info');
          console.log('delete entry failed', err);
        });
    } else {
      alert("Entry not saved in database");
    }
  }

  const entryPopup = (activeEntry) => {
    return !activeEntry ? null : (
      <div className="basic-interface__popup">
        <div className="basic-interface__popup-header flex-wrap-center-left">
          <h2>Edit</h2>
          <button type="button" className="flex-wrap-center-center" onClick= { () => closeEntryPopup() }>
            <img src={ closeIcon } alt="Close edit entry popup" />
          </button>
        </div>
        <div className="basic-interface__popup-body flex-col-center-center">
          <input type="text" value={ activeEntry.name } onChange={ (event) => popupInputHandler( 'name', event.target.value, true ) } />
          <input type="number" value={ activeEntry.calories } onChange={ (event) => popupInputHandler( 'amount', event.target.value, true ) } />
        </div>
        <div className="basic-interface__popup-footer flex-wrap-center-left">
          <button type="button" className="delete" onClick={ () => deleteEntry(activeEntry.id) }>Delete</button>
          <button type="button" className="save" 
            disabled={ !activeEntryModified }
            onClick={ () => saveActiveEntryChanges(activeEntry.id) }
          >Save</button>
        </div>
      </div>
    )
  }

  const saveWeight = () => {
    if (weightInput > 0) {
      if (!db) {
        alert('Database not created');
        return false;
      }
  
      db.weight.add({
        weight: weightInput,
        datetime: getDateTime("MM-DD-YYYY")
      }).then(() => {
        setShowWeightPrompt(false);
      }).catch((err) => {
        console.log(err);
        alert('Failed to save weight');
      });
    } else {
      alert('Please enter a value for weight');
    }
  }

  const weightPrompt = () => {
    return !showWeightPrompt ? null
      : (
        <div className="basic-interface__weight-prompt">
          <div className="basic-interface__weight-prompt-modal">
            <p>How much do you weigh today?</p>
            <span>
              <input type="number" placeholder="0" value={weightInput} onChange={ (e) => setWeightInput(e.target.value) }/>
              <p>lbs</p>
            </span>
            <button type="button" onClick={() => saveWeight()}>save</button>
          </div>
        </div>
      );
  }

  const checkSavedFoods = (string) => {
    console.log('search', string);
  }

  // setup Dexie datastore
  useEffect(() => {
    // checks if Dexie database exists, creates it if not
    const db = new Dexie('CalorieCounterPwa');
    db.version(1).stores({
      entries: "++id,name,calories,gain,datetime",
      weight: "++,weight,datetime"
    });
 
    db.open()
      .then(() => {
        // check weight
        if (!weight) {
          db.weight.where("datetime")
            .equals(getDateTime("MM-DD-YYYY")).toArray()
            .then((weights) => { // should only be one per day
              if (weights.length) {
                setWeight(weights[0].weight);
              } else {
                setShowWeightPrompt(true);
              }
              setDb(db);
            });
        }
        setDb(db);
      })
      .catch((err) => {
        console.log(err);
        alert("something went wrong", err.message)
      });
  }, []);

  useEffect(() => {
    if (db) {
      getTodaysData(db);
    }
  }, [db]);

  return (
    <div className="basic-interface">
      { weightPrompt() }
      { entryPopup(activeEntry) }
      <div className="basic-interface__header flex-wrap-center-center">
        <div className="basic-interface__header-total-calories">
          <h2>
            { sumCalories() }
            <span>c</span>
          </h2>
        </div>
        <div className="basic-interface__header-date-group flex-col-center-right">
          <span>{ getToday() }</span>
          <span>{ getDateTime("MM/DD/YYYY") }</span>
        </div>
      </div>
      <div className="basic-interface__input flex-wrap-stretch-left">
        <div className="basic-interface__input-name-wrapper">
          <input
            placeholder="Name"
            type="text"
            className="basic-interface__input-name"
            onChange={(e) => { checkSavedFoods(e.target.value) }}
            ref={ entryName }
            value={ suggestedFood.name || "" }
          />
          { suggestedFoods.length ? <div className="basic-interface__input-search-suggestions">
            {
              suggestedFoods.map((food, index) => <div
                key={index}
                className="input-search-suggestions__suggestion"
                data-calories={food.calories}
                onClick={() => {
                  setSuggestedFood(food);
                  setSuggestedFoods([]);
                }}
              >{ food.name }</div>)
            }
          </div> : null }
        </div>
        <input
          placeholder="Calories"
          type="number"
          className="basic-interface__input-calories"
          ref={ entryAmount }
          value={ suggestedFood.calories || 0 }
          onChange={(e) => { setSuggestedFood({
              ...suggestedFood,
              calories: e.target.value
            })
          }}
        />
        <button type="button" className="basic-interface__input-submit" onClick={ () => addCalories() } ref={ calorieAddBtn }>Add</button>
      </div>
      { entryRows }
    </div>
  )
}

export default BasicInterface;