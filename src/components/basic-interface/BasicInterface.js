import React, { Component } from 'react';
import './../../misc/styles/layout.scss';
import './BasicInterface.scss';
import './BasicInterface-widget.scss'; // terrible whip me till I bleed
import closeIcon from './../../misc/icons/close-icon__chocolate.svg';

class BasicInterface extends Component {
    state = {
        date: new Date(),
        today: null,
        todaysDate: null,
        calories: 0, // total calories for the day
        entries: [], // list of calorie 
        activePopupEntry: null, // should be object when set
        activePopupEntryModified: false
    }

    // methods
    getToday = this.getToday.bind(this);
    dateSlash = this.dateSlash.bind(this);
    getTodaysEvents = this.getTodaysEvents.bind(this);
    renderEvents = this.renderEvents.bind(this);
    addInterface = this.addInterface.bind(this);

    // inputs


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

    updateSessionStorage(newState) {
        sessionStorage.setItem(this.state.todaysDate, JSON.stringify(
            {
                calories: newState.calories,
                entries: newState.entries
            }
        ));

        this.calorieAddBtn.current.removeAttribute('disabled');
    }

    generateUniqueId() {
        // use timestamp
        return Date.now();
    }

    dateSlash(dateStr) {
        return dateStr.split('-').join('/');
    }

    componentWillMount() {
        const todaysDate = this.getTodaysDate();

        this.setState(prevState => ({
            today: this.getToday(),
            todaysDate: todaysDate
        }));
    }

    getTodaysEvents() {
        const entries = sessionStorage.getItem(this.state.todaysDate);
        return entries ? entries : [];
    }

    renderEvents() {
        return (
            <div className="basic-interface__entry">
                Something should be here, but alas, time is not
            </div>
        );
    }

    // forgive me
    title = React.createRef();
    body = React.createRef();
    checkbox = React.createRef();

    saveEntry = this.saveEntry.bind(this);

    saveEntry() {
        alert('save');
        const title = this.title.current.value;
        const body = this.body.current.value;
        const isRecurring = this.checkbox.current.value;
        const todaysDate = this.state.todaysDate;
        const curEntries = sessionStorage.getItem(todaysDate);
        const newEntry = {
            id: this.generateUniqueId(),
            icon: "",
            title: title,
            body: body,
            recurring: isRecurring,
            occurred: false
        };

        if (curEntries) {
            sessionStorage.setItem(todaysDate, JSON.parse(curEntries).push({newEntry}));
        } else {
            sessionStorage.setItem(todaysDate, JSON.stringify([newEntry]));
        }
    }

    addInterface() {
        return (
            <div className="basic-interface__widget-container">
                <div className="basic-interface__widget">
                    <button type="button" className="basic-interface__widget-close-btn">Close</button>
                    <input ref={ this.title } placeholder="title" className="full-width" type="text" />
                    <textarea ref={ this.body } placeholder="body" />
                    <div className="basic-interface__span-wrapper">
                        <span>
                            <input ref={ this.checkbox } id="widget__recurring-checkbox checkbox" type="checkbox" />
                            <label htmlFor="widget__recurring-checkbox">recurring</label>
                        </span>
                        <button type="button" onClick={ this.saveEntry }>OK</button>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const todaysDateFormatted = this.dateSlash(this.state.todaysDate);
        const todaysEvents = this.getTodaysEvents();
        const displayContent = !todaysEvents.length
            ? this.addInterface()
            : this.renderEvents(todaysEvents);

        return (
            <div className="basic-interface">
                <div className="basic-interface__header flex-wrap-center-center">
                    <div className="basic-interface__header-total-calories"></div>
                    <div className="basic-interface__header-date-group flex-col-center-right">
                        <span>{this.state.today}</span>
                        <span>{todaysDateFormatted}</span>
                    </div>
                </div>
                <div className="basic-interface__display">
                    {displayContent}
                </div>
            </div>
        )
    }
}

export default BasicInterface;