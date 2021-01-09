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
        count: 4
      },
      row2: {
        text: "Alex\n" + getCurrentDate(),
        count: 7
      }
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(t) {
    return function (row, field) {
      return function (event) {
        t.setState((state) => {
          switch (field) {
            case "count":
              state[row][field] = parseInt(event.target.value)
              break
            case "text":
              state[row][field] = event.target.value
              break
            default:
              alert("Unknown field: " + field)
          }
          return state
        })
      }
    }
  }

  handleSubmit(event) {
    console.log("State is:" + JSON.stringify(this.state))
    axios.post('/printLabel', JSON.stringify(this.state))
        .then(function (response) {
          if (response.status === 200) {
            alert("Success!")
          }
        })
        .catch(function (error) {
          alert("Error: " + error)
        });

    event.preventDefault();
  }


  render() {
    const rows = Object.entries(this.state).map((key) => {
      const row = key[0]
      const data = key[1]
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
