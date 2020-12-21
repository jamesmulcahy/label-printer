import logo from './logo.svg';
import './App.css';
import Row from './Row.js';
import {Component} from "react";
const axios = require('axios').default;


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      row1: {
        text: "Oliver\n" + getCurrentDate(),
        count: 5
      },
      row2: {
        text: "Alex\n" + getCurrentDate(),
        count: 5
      }
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(t) {
    return function (row, field) {
      return function (event) {
        console.log("change! " + row + "field: " + field + " " + event.target.value + " state: " + JSON.stringify(t.state))
        t.setState((state) => {
          state[row][field] = event.target.value
          return state
        })
      }
    }
  }

  handleSubmit(event) {
    console.log("State is:" + JSON.stringify(this.state))
    alert(this.state)
    axios.post('/printLabel', JSON.stringify(this.state))
        .then(function (response) {
          if (response.status === 200) {
            console.log("Done!")
          }
        })
        .catch(function (error) {
          console.log("Error: " + error)
        });

    event.preventDefault();
  }


  render() {
    const rows = Object.entries(this.state).map((key) => {
      const row = key[0]
      const data = key[1]
      console.log("V: " + row)
      return (<Row name={row} key={row} text={data.text} count={data.count} cb={this.handleChange(this)}/>)
      }
    );

    return (
        <div className="App">
          <header className="App-header">
            <div>
              <form onSubmit={this.handleSubmit}>
                {rows}
                <input type="submit" value="Print"/>
              </form>
            </div>
          </header>
        </div>
    );
  }
}

function getCurrentDate() {
  const curDate = new Date();
  // WTF Javascript?!
  return ((curDate.getMonth() + 1) % 13) + "/" + curDate.getDate()
}

export default App;
