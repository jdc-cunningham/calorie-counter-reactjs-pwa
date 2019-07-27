import React, { Component } from 'react';
import './../../misc/styles/layout.scss';
import './BasicInterface.scss';

class BasicInterface extends Component {
  state = {
    date: new Date(),
    today: null,
    todaysDate: null,
    calories : 0, // total calories for the day
    entries: [] // list of calorie entries
  }

  // methods
  addCalories = this.addCalories.bind( this );
  getToday = this.getToday.bind( this );
  getTodaysCalories = this.getTodaysCalories.bind( this );
  getTodaysCalorieEntries = this.getTodaysCalorieEntries.bind( this );
  dateSlash = this.dateSlash.bind( this );
  toggleEditRow = this.toggleEditRow.bind( this );

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
    return todaysCalories ? JSON.parse(todaysCalories).total : 0;
  }

  getTodaysCalorieEntries( todaysDate ) {
    const todaysCalorieEntries = sessionStorage.getItem( todaysDate ? todaysDate : this.state.todaysDate );
    return todaysCalorieEntries ? JSON.parse( todaysCalorieEntries ).entries : [];
  }

  updateSessionStorage( newState ) {
    sessionStorage.setItem( this.state.todaysDate, JSON.stringify(
      {
        total: newState.calories,
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
      calories: currentCalories,
      entries: currentCalorieEntries
    };

    this.updateSessionStorage( newState );
    this.clearInputs();
    this.setState( prevState => (newState) );
  }

  dateSlash( dateStr ) {
    return dateStr.split( '-' ).join( '/' );
  }

  toggleEditRow( entryId ) {
    console.log( entryId );
  }

  componentWillMount() {
    const todaysDate = this.getTodaysDate();

    this.setState( prevState => ({
      today: this.getToday(),
      todaysDate: todaysDate,
      calories : parseInt( this.getTodaysCalories(todaysDate) ),
      entries: this.getTodaysCalorieEntries( todaysDate ),
    }));
  }

  render() {
    const todaysDateFormatted = this.dateSlash(this.state.todaysDate),
          entryRows = this.state.entries.map( (entry, index) => {
            return(
              <div key={ index } onClick={ () => this.toggleEditRow(entry.id) } className="basic-interface__entry flex-wrap-center-left">
                <span className="entry__name">{ entry.name }</span>
                <span className="entry__calories">{ (entry.gain ? '+' : '-') + entry.amount }c</span>
              </div>
            )
          });;

    return(
      <div className="basic-interface">
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