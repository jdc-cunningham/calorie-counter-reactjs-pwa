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

  addCalories = this.addCalories.bind( this );
  getToday = this.getToday.bind( this );
  getTodaysCalories = this.getTodaysCalories.bind( this );
  getTodaysCalorieEntries = this.getTodaysCalorieEntries.bind( this );
  dateSlash = this.dateSlash.bind( this );

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

  getTodaysCalories() {
    // console.log( this.state );
    let todaysCalories = sessionStorage.getItem( this.state.todaysDate );
    return todaysCalories ? JSON.parse( todaysCalories ).total : 0;
  }

  updateCalories( dateStr, calories, add ) {
    let daysCalories = sessionStorage.getItem( dateStr ) ? JSON.parse( sessionStorage.getItem(dateStr) ).total : 0,
        newCalories = 0;

    if ( add ) {
      if ( daysCalories ) {
        newCalories = calories += daysCalories;
      }
    } else {
      newCalories = daysCalories - calories;
    }

    sessionStorage.setItem( dateStr, newCalories );
  }

  getTodaysCalorieEntries() {
    const todaysCalorieEntries = sessionStorage.getItem( this.state.todaysDate );
    return todaysCalorieEntries ? JSON.parse( todaysCalorieEntries ).entries : [];
  }

  updateSessionStorage() {
    sessionStorage.setItem( this.state.todaysDate, JSON.stringify(this.state) );
  }

  addCalories( calories ) {
    // this.setState({
    //   calories: this.state.calories + 10
    // });
    // console.log( this.state.calories + 10 );

    // console.log( this.state );

    let entries = this.state.entries.length ? this.state.entries : [];
    
    entries.push({
      name: 'test',
      calories: calories,
      gain: true
    });

    console.log( entries );

    this.setState( prevState => ({
      calories: this.state.calories + calories,
      entries: entries
    }));

    // this.updateSessionStorage();
  }

  dateSlash( dateStr ) {
    return dateStr.split( '-' ).join( '/' );
  }

  componentWillMount() {
    this.setState( prevState => ({
      today: this.getToday(),
      todaysDate: this.getTodaysDate(),
      calories : this.getTodaysCalories(),
      entries: this.getTodaysCalorieEntries(),
    }));
  }

  render() {
    const todaysDateFormatted = this.dateSlash(this.state.todaysDate);

    return(
      <div className="basic-interface">
        {/* { this.state.calories }
        <button type="button" onClick={ () => this.addCalories( 30 ) }>Add Calories</button> */}
        <div className="basic-interface__header flex-wrap-center-center">
          <div className="basic-interface__header-total-calories">
            <h2>{ this.state.calories }</h2>
          </div>
          <div className="basic-interface__header-date-group flex-col-top-left">
            <span>{ this.state.today }</span>
            <span>{ todaysDateFormatted }</span>
          </div>
        </div>
      </div>
    )
  }
}

export default BasicInterface;