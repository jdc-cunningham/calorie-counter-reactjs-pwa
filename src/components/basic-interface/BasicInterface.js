import React, { Component } from 'react';
import './../../misc/styles/layout.scss';
import './BasicInterface.scss';
import './BasicInterfaceWidget.scss'; // terrible whip me till I bleed
import './BasicInterfaceEntryRow.scss';
import closeIcon from './../../misc/icons/close-icon__chocolate.svg';

class BasicInterface extends Component {
    state = {
        date: new Date(),
        today: null,
        todaysDate: null,
        calories: 0, // total calories for the day
        entries: [], // list of calorie 
        activePopupEntry: null, // should be object when set
        activePopupEntryModified: false,
        renderedItemOpenStates: {}
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

    updatelocalStorage(newState) {
        localStorage.setItem(this.state.todaysDate, JSON.stringify(
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

    componentDidMount() {
        const todaysEvents = this.getTodaysEvents();
        const tmpObj = {};

        // tragedy
        if (todaysEvents.length) {
            todaysEvents.forEach((event) => {
                tmpObj[event.id] = false;
            });
        }

        this.setState(prevState => ({
            renderedItemOpenStates: tmpObj
        }));
    }

    getTodaysEvents() {
        const entries = localStorage.getItem(this.state.todaysDate);
        return entries ? JSON.parse(entries) : [];
    }

    openRow(entryId) {
        // god this brutal
        const renderedItemOpenStates = this.state.renderedItemOpenStates;
        const newState = {};
        Object.keys(renderedItemOpenStates).forEach((key) => {
            if (entryId === parseInt(key)) { // lol
                newState[key] = !renderedItemOpenStates[entryId];
            } else {
                newState[key] = renderedItemOpenStates[entryId]; // holy cow this is brutal coding I HAVE NO BRAIN!!!
            }
        });
        this.setState(prevState => ({
            renderedItemOpenStates: newState
        }));
    }

    renderEvents(todaysEvents) {
        const dispState = this.state.renderedItemOpenStates;

        return todaysEvents.map((event, key) => { // returns array of JSX? whack, I realize map returns array but I tried forEach too
            const rowOpen = (event.id in dispState && dispState[event.id]) ? "open" : "";

            return <div key={key} className={`basic-interface__entry ${rowOpen}`}>
                <span>
                    <span className="inner" onClick={ () => this.openRow(event.id) }>
                        <div className="basic-interface__entry-icon"></div>
                        <div className="basic-interface__entry-title">{event.title}</div>
                    </span>
                    <div className="basic-interface__three-dots">
                        <div className="basic-interface__dot"></div>
                        <div className="basic-interface__dot middle"></div>
                        <div className="basic-interface__dot"></div>
                    </div>
                </span>
                <div className="basic-interface__entry-body">{event.body}</div>                
            </div>;
        });
    }

    // forgive me
    title = React.createRef();
    body = React.createRef();
    checkbox = React.createRef();

    saveEntry = this.saveEntry.bind(this);

    saveEntry() {
        const title = this.title.current.value;
        const body = this.body.current.value;
        const isRecurring = this.checkbox.current.value;
        const todaysDate = this.state.todaysDate;
        let curEntries = localStorage.getItem(todaysDate);

        if (!title.length || !body.length) {
            alert("Both title and body fields required"); // bad
            return false;
        }

        const newEntry = {
            id: this.generateUniqueId(),
            icon: "",
            title: title,
            body: body,
            recurring: isRecurring,
            occurred: false
        };

        if (curEntries) {
            curEntries = JSON.parse(curEntries);
            curEntries.push(newEntry);
            localStorage.setItem(todaysDate, JSON.stringify(curEntries));
        } else {
            localStorage.setItem(todaysDate, JSON.stringify([newEntry]));
        }

        alert('saved!');
        this.setState(this.state); // reload
    }

    addInterface() {
        return (
            <div className="basic-interface__add-widget-container">
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
            // omg wtf is this
            : <>
                {this.renderEvents(todaysEvents)}
                {this.addInterface()}
            </>;

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