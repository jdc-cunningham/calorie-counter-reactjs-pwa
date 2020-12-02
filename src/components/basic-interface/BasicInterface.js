  
import React, { useEffect, useState, useRef } from 'react';
import './../../misc/styles/layout.scss';
import './BasicInterface.scss';
import { isObject, getDateTime } from './../../misc/js/utilities.js';
import closeIcon from './../../misc/icons/close-icon__chocolate.svg';
import Dexie from 'dexie';

const BasicInterface = () => {
  const [db, setDb] = useState(null);
  const [entries, setEntries] = useState([
    // {
    //   name: "TMA",
    //   gain: true,
    //   calories: 300,
    //   datetime: "11-27-2020"
    // }
  ]);
  
  // inputs
  const entryName = useRef(null);
  const entryAmount = useRef(null);
  const calorieAddBtn = useRef(null);

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

    db.entries.add({
        name: entryName.current.value, 
        calories: entryAmount.current.value,
        gain: true,
        datetime: getDateTime("MM-DD-YYYY")
    }).then((insertedId) => {
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

  }

  const getTodaysData = (db) => {
    const todaysDate = getDateTime("MM-DD-YYYY");
    let todaysCalories = 0;
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

  useEffect(() => {
    // checks if Dexie database exists, creates it if not
    const db = new Dexie('CalorieCounterPwa');
    db.version(1).stores({
      entries: "++id,name,calories,gain,datetime"
    });
 
    db.open()
      .then(() => {
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
      {/* { entryPopup } */}
      <div className="basic-interface__header flex-wrap-center-center">
        <div className="basic-interface__header-total-calories">
          <h2>
            {/* { this.state.calories } */}
            <span>c</span>
          </h2>
        </div>
        <div className="basic-interface__header-date-group flex-col-center-right">
          <span>{ "today" }</span>
          <span>{ "today" }</span>
        </div>
      </div>
      <div className="basic-interface__input flex-wrap-stretch-left">
        <input placeholder="Name" type="text" className="basic-interface__input-name" ref={ entryName } />
        <input placeholder="Calories" type="number" className="basic-interface__input-calories" ref={ entryAmount } />
        <button type="button" className="basic-interface__input-submit" onClick={ () => addCalories() } ref={ calorieAddBtn }>Add</button>
      </div>
      { entryRows }
    </div>
  )
}

export default BasicInterface;