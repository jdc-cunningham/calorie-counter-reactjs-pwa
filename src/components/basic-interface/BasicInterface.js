import React, { Component } from 'react';
import './../../misc/styles/layout.scss';
import './BasicInterface.scss';
import { isObject, getDateTime } from './../../misc/js/utilities.js';
import closeIcon from './../../misc/icons/close-icon__chocolate.svg';
import Dexie from 'dexie';

class BasicInterface extends Component {
  state = {
    date: new Date(),
    today: null,
    todaysDate: null,
    calories : 0, // total calories for the day
    entries: [], // list of calorie 
    activePopupEntry: null, // should be object when set
    activePopupEntryModified: false,
    storage: null,
    mountChecked: false // way to stop dumb async events ahh
  }

  // methods
  addCalories = this.addCalories.bind( this );
  getToday = this.getToday.bind( this );
  dateSlash = this.dateSlash.bind( this );
  togglePopup = this.togglePopup.bind( this );
  popupInputHandler = this.popupInputHandler.bind( this );
  savePopupEntryChanges = this.savePopupEntryChanges.bind( this );
  closePopup = this.closePopup.bind( this );
  deleteEntry = this.deleteEntry.bind( this );
  updateLocalStorage = this.updateLocalStorage.bind( this );

  // inputs
  calorieName = React.createRef();
  calorieAmount = React.createRef();
  calorieAddBtn = React.createRef();

  getToday() {
    const intDayMap = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
          ],
          dayInt = this.state.date.getDay();

    return intDayMap[dayInt];
  }

  getTodaysDate() {
    // https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript

    let today = new Date(),
        dd = String(today.getDate()).padStart(2, '0'),
        mm = String(today.getMonth() + 1).padStart(2, '0'), //January is 0!
        yyyy = today.getFullYear();

    today = mm + '-' + dd + '-' + yyyy;
    return today;
  }

  getTodaysData( db ) {
    const todaysDate = this.getTodaysDate();
    let todaysCalories = 0;
    db.entries.where("datetime").equals(todaysDate).toArray().then((entries) => { // ehh not a datetime operation probably faster than string comp
      entries.forEach(entry => {
        todaysCalories += entry.calories;
      });
      this.setState((prevState) => ({
        ...prevState,
        entries: entries,
        calories: todaysCalories,
        mountChecked: true,
      }));
    });  }

  updateLocalStorage( entryName, calories ) {
    const storage = this.state.storage;

    storage.entries.add({
        name: entryName,
        calories: calories,
        gain: true,
        datetime: getDateTime("MM-DD-YYYY")
    }).then((insertedId) => {
      let currentCalories = this.state.calories,
      currentCalorieEntries = this.state.entries,
      newEntry = {
        id: this.generateUniqueId(),
        name: entryName,
        amount: calories,
        gain: calories > 0 ? true : false
      },
      newState = {};

      currentCalorieEntries.push( newEntry );
      currentCalories += calories;

      newState = {
        date: this.state.date,
        today: this.state.today,
        todaysDate: this.state.todaysDate,
        calories: currentCalories,
        entries: currentCalorieEntries,
        activePopupEntry: null,
        activePopupEntryModified: false
      };

      this.clearInputs();
      this.setState( prevState => (newState) );
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      this.calorieAddBtn.current.removeAttribute( 'disabled' );
    });
  }

  generateUniqueId() {
    // use timestamp
    return Date.now();
  }

  clearInputs() {
    this.calorieName.current.value = '';
    this.calorieAmount.current.value = '';
  }

  addCalories() {
    this.calorieAddBtn.current.setAttribute( 'disabled', true );

    const calorieName = this.calorieName.current.value,
          calorieAmount = parseInt( this.calorieAmount.current.value );

    if ( !calorieName || !calorieAmount ) {
      alert( 'Please fill in both calorie name and calorie amount' );
      this.calorieAddBtn.current.removeAttribute( 'disabled' );
      return;
    }

    this.updateLocalStorage( calorieName, calorieAmount );
  }

  dateSlash( dateStr ) {
    return dateStr.split( '-' ).join( '/' );
  }

  togglePopup( entry ) {
    this.setState( prevState => ({
      activePopupEntry: entry
    }));
  }

  popupInputHandler( whichInput, event ) {
    let curEntry = this.state.activePopupEntry;
    if ( whichInput === 'name' ) {
      curEntry.name = event.target.value;
    } else {
      curEntry.calories = event.target.value;
    }

    this.setState( prevState => ({
      activePopupEntry: curEntry,
      activePopupEntryModified: true
    }));
  }

  savePopupEntryChanges() {
    // let curEntry = this.state.activePopupEntry,
    //     curEntries = this.state.entries,
    //     newTotalCalories = 0,
    //     newState = {};

    // console.log(curEntries);

    // curEntries.forEach( (entry, id) => {
    //   if ( entry.id === curEntry.id ) {
    //     curEntries[id] = curEntry;
    //   }
    //   newTotalCalories += parseInt( entry.calories );
    // });

    // newState = {
    //   date: this.state.date,
    //   today: this.state.today,
    //   todaysDate: this.state.todaysDate,
    //   calories: newTotalCalories,
    //   entries: curEntries,
    //   activePopupEntryModified: false,
    //   activePopupEntry: null
    // };
    // this.updateLocalStorage( curEntry =  );
    // this.setState( prevState => ( newState ));
  }

  closePopup() {
    this.setState( prevState => ({
      activePopupEntryModified: false,
      activePopupEntry: null
    }));
  }

  deleteEntry() {
    let curEntries = this.state.entries,
        activeEntryId = this.state.activePopupEntry.id,
        newTotalCalories = 0,
        newState = {};
        
    curEntries.forEach( (entry, id) => {
      if ( entry.id === activeEntryId ) {
        curEntries.splice(id, 1);
      } else {
        newTotalCalories += parseInt( entry.amount );
      }
    });
 
    newState = {
      date: this.state.date,
      today: this.state.today,
      todaysDate: this.state.todaysDate,
      calories: newTotalCalories,
      entries: curEntries,
      activePopupEntryModified: false,
      activePopupEntry: null
    };
    this.updateLocalStorage( newState );
    this.setState( prevState => ( newState ));
  }

  componentDidUpdate(prevProps, prevState) { // componentWillUpdate(nextProps, nextState)
    console.log('did update');

    if (this.state.storage && !this.state.mountChecked) {
      this.getTodaysData(this.state.storage);
    }
  }

  componentWillMount() {
    const todaysDate = this.getTodaysDate();

    // checks if Dexie database exists, creates it if not
    const db = new Dexie('CalorieCounterPwa');
		db.version(1).stores({
			entries: "++id,name,calories,gain,datetime"
    });

    db.open()
      .then(() => {
        // init other states required for render
        console.log('call 1');
        this.setState( prevState => ({
          ...prevState,
          today: this.getToday(),
          todaysDate: todaysDate,
          storage: db,
          calories: 0,
          // entries: curEntries,
        }));
      })
      .catch((err) => {
        console.log(err);
        alert("something went wrong", err.message)
      });
  }

  // has double init render due to above
  render() {
    console.log(this.state);
    const todaysDate = this.state.todaysDate;
    const todaysDateFormatted = todaysDate ? this.dateSlash(this.state.todaysDate) : "",
          entryRows = this.state.entries.map( (entry, index) => {
            return(
              <div key={ index } onClick={ () => this.togglePopup(entry) } className="basic-interface__entry flex-wrap-center-left">
                <span className="entry__name">{ entry.name }</span>
                <span className="entry__calories">{ (entry.gain ? '+' : '-') + entry.calories }c</span>
              </div>
            )
          });
    const activeEntry = this.state.activePopupEntry;
    // const entryPopup = (function( activeEntry, self ) {
    //   if ( isObject(activeEntry) ) {
    //     return(
    //       <div className="basic-interface__popup">
    //         <div className="basic-interface__popup-header flex-wrap-center-left">
    //           <h2>Edit</h2>
    //           <button type="button" className="flex-wrap-center-center" onClick= { self.closePopup }>
    //             <img src={ closeIcon } alt="Close edit entry popup" />
    //           </button>
    //         </div>
    //         <div className="basic-interface__popup-body flex-col-center-center">
    //           <input type="text" value={ activeEntry.name } onChange={ (event) => self.popupInputHandler( 'name', event ) } />
    //           <input type="number" value={ activeEntry.calories } onChange={ (event) => self.popupInputHandler( 'amount', event ) } />
    //         </div>
    //         <div className="basic-interface__popup-footer flex-wrap-center-left">
    //           <button type="button" className="delete" onClick={ self.deleteEntry }>Delete</button>
    //           <button type="button" className="save" 
    //             disabled={ !self.state.activePopupEntryModified }
    //             onClick={ self.savePopupEntryChanges }
    //           >Save</button>
    //         </div>
    //       </div>
    //     )
    //   }
    // })( activeEntry, this );

    return(
      <div className="basic-interface">
        {/* { entryPopup } */}
        <div className="basic-interface__header flex-wrap-center-center">
          <div className="basic-interface__header-total-calories">
            <h2>
              { this.state.calories }
              <span>c</span>
            </h2>
          </div>
          <div className="basic-interface__header-date-group flex-col-center-right">
            <span>{ this.state.today }</span>
            <span>{ todaysDateFormatted }</span>
          </div>
        </div>
        <div className="basic-interface__input flex-wrap-stretch-left">
          <input placeholder="Name" type="text" className="basic-interface__input-name" ref={ this.calorieName } />
          <input placeholder="Calories" type="number" className="basic-interface__input-calories" ref={ this.calorieAmount } />
          <button type="button" className="basic-interface__input-submit" onClick={ this.addCalories } ref={ this.calorieAddBtn }>Add</button>
        </div>
        { entryRows }
      </div>
    )
  }
}

export default BasicInterface;