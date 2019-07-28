import React, { Component } from 'react';
import './../../misc/styles/layout.scss';
import './BasicInterface.scss';
import { isObject } from './../../misc/js/utilities.js';
import closeIcon from './../../misc/icons/close-icon__chocolate.svg';

class BasicInterface extends Component {
  state = {
    date: new Date(),
    today: null,
    todaysDate: null,
    calories : 0, // total calories for the day
    entries: [], // list of calorie 
    activePopupEntry: null, // should be object when set
    activePopupEntryModified: false
  }

  // methods
  addCalories = this.addCalories.bind( this );
  getToday = this.getToday.bind( this );
  getTodaysCalories = this.getTodaysCalories.bind( this );
  getTodaysCalorieEntries = this.getTodaysCalorieEntries.bind( this );
  dateSlash = this.dateSlash.bind( this );
  togglePopup = this.togglePopup.bind( this );
  popupInputHandler = this.popupInputHandler.bind( this );
  savePopupEntryChanges = this.savePopupEntryChanges.bind( this );
  closePopup = this.closePopup.bind( this );
  deleteEntry = this.deleteEntry.bind( this );

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

  getTodaysCalories( todaysDate ) {
    let todaysCalories = sessionStorage.getItem( todaysDate ? todaysDate : this.state.todaysDate );
    return todaysCalories ? JSON.parse(todaysCalories).calories : 0;
  }

  getTodaysCalorieEntries( todaysDate ) {
    const todaysCalorieEntries = sessionStorage.getItem( todaysDate ? todaysDate : this.state.todaysDate );
    return todaysCalorieEntries ? JSON.parse( todaysCalorieEntries ).entries : [];
  }

  updateSessionStorage( newState ) {
    sessionStorage.setItem( this.state.todaysDate, JSON.stringify(
      {
        calories: newState.calories,
        entries: newState.entries
      }
    ));

    this.calorieAddBtn.current.removeAttribute( 'disabled' );
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

    let currentCalories = this.state.calories,
        currentCalorieEntries = this.state.entries,
        newEntry = {
          id: this.generateUniqueId(),
          name: calorieName,
          amount: calorieAmount,
          gain: calorieAmount > 0 ? true : false
        },
        newState = {};

    currentCalorieEntries.push( newEntry );
    currentCalories += calorieAmount;

    newState = {
      date: this.state.date,
      today: this.state.today,
      todaysDate: this.state.todaysDate,
      calories: currentCalories,
      entries: currentCalorieEntries,
      activePopupEntry: null,
      activePopupEntryModified: false
    };

    this.updateSessionStorage( newState );
    this.clearInputs();
    this.setState( prevState => (newState) );
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
      curEntry.amount = event.target.value;
    }

    this.setState( prevState => ({
      activePopupEntry: curEntry,
      activePopupEntryModified: true
    }));
  }

  savePopupEntryChanges() {
    let curEntry = this.state.activePopupEntry,
        curEntries = this.state.entries,
        newTotalCalories = 0,
        newState = {};

    curEntries.forEach( (entry, id) => {
      if ( entry.id === curEntry.id ) {
        curEntries[id] = curEntry;
      }
      newTotalCalories += parseInt( entry.amount );
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
    this.updateSessionStorage( newState );
    this.setState( prevState => ( newState ));
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
    this.updateSessionStorage( newState );
    this.setState( prevState => ( newState ));
  } 

  componentWillMount() {
    const todaysDate = this.getTodaysDate();

    this.setState( prevState => ({
      today: this.getToday(),
      todaysDate: todaysDate,
      calories: parseInt( this.getTodaysCalories(todaysDate) ),
      entries: this.getTodaysCalorieEntries( todaysDate )
    }));
  }

  render() {
    const todaysDateFormatted = this.dateSlash(this.state.todaysDate),
          entryRows = this.state.entries.map( (entry, index) => {
            return(
              <div key={ index } onClick={ () => this.togglePopup(entry) } className="basic-interface__entry flex-wrap-center-left">
                <span className="entry__name">{ entry.name }</span>
                <span className="entry__calories">{ (entry.gain ? '+' : '-') + entry.amount }c</span>
              </div>
            )
          });
    const activeEntry = this.state.activePopupEntry;
    const entryPopup = (function( activeEntry, self ) {
      if ( isObject(activeEntry) ) {
        return(
          <div className="basic-interface__popup">
            <div className="basic-interface__popup-header flex-wrap-center-left">
              <h2>Edit</h2>
              <button type="button" className="flex-wrap-center-center" onClick= { self.closePopup }>
                <img src={ closeIcon } alt="Close edit entry popup" />
              </button>
            </div>
            <div className="basic-interface__popup-body flex-col-center-center">
              <input type="text" value={ activeEntry.name } onChange={ (event) => self.popupInputHandler( 'name', event ) } />
              <input type="number" value={ activeEntry.amount } onChange={ (event) => self.popupInputHandler( 'amount', event ) } />
            </div>
            <div className="basic-interface__popup-footer flex-wrap-center-left">
              <button type="button" className="delete" onClick={ self.deleteEntry }>Delete</button>
              <button type="button" className="save" 
                disabled={ !self.state.activePopupEntryModified }
                onClick={ self.savePopupEntryChanges }
              >Save</button>
            </div>
          </div>
        )
      }
    })( activeEntry, this );

    return(
      <div className="basic-interface">
        { entryPopup }
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