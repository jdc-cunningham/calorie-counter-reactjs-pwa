import React, { Component } from 'react';
import './BasicInterface.scss';

class BasicInterface extends Component {
  getTodaysDate() {
    // https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript

    let today = new Date(),
        dd = String(today.getDate()).padStart(2, '0'),
        mm = String(today.getMonth() + 1).padStart(2, '0'), //January is 0!
        yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;
    return today;
  }

  getTodaysCalories() {
    const todaysCalories = sessionStorage.getItem( this.getTodaysDate() );
    return todaysCalories ? todaysCalories : 0;
  }

  updateCalories( dateStr, calories, add ) {
    let daysCalories = sessionStorage.getItem( dateStr ),
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

  state = {
    calories : this.getTodaysCalories()
  }

  addTenCalories() {
    // this.setState({
    //   calories: this.state.calories + 10
    // });
    console.log( this.state.calories + 10 );
  }

  render() {
    return(
      <div className="basic-interface">
        { this.state.calories }
        <button type="button" onClick={ this.addTenCalories }>Add 10 Calories</button>
      </div>
    )
  }
}

export default BasicInterface;