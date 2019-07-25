import React, { Component } from 'react';
import './BasicInterface.scss';

class BasicInterface extends Component {
  state = {
    today: this.getTodaysDate(),
    calories : 0, // this.getTodaysCalories(),
    entries: [] // this.getTodaysCalorieEntries(),
  }

  addCalories = this.addCalories.bind( this );
  getTodaysCalories = this.getTodaysCalories.bind( this );
  getTodaysCalorieEntries = this.getTodaysCalorieEntries.bind( this );

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
    let todaysCalories = sessionStorage.getItem( this.state.today );
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
    const todaysCalorieEntries = sessionStorage.getItem( this.state.today );
    return todaysCalorieEntries ? JSON.parse( todaysCalorieEntries ).entries : [];
  }

  updateSessionStorage() {
    sessionStorage.setItem( this.state.today, JSON.stringify(this.state) );
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

  componentDidMount() {
    this.setState( prevState => ({
      calories : this.getTodaysCalories(),
      entries: this.getTodaysCalorieEntries(),
    }));
  }

  render() {
    

    return(
      <div className="basic-interface">
        { this.state.calories }
        <button type="button" onClick={ () => this.addCalories( 30 ) }>Add Calories</button>
      </div>
    )
  }
}

export default BasicInterface;