import React from "react";
import FadeIn from "react-fade-in";
import Lottie from "react-lottie";
import './CovidVisualization.css';
import "bootstrap/dist/css/bootstrap.css";
import * as legoData from "./legoloading.json";
import * as doneData from "./doneloading.json";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import countries from './Countries';

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: legoData.default,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice"
  }
};
const defaultOptions2 = {
  loop: false,
  autoplay: true,
  animationData: doneData.default,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice"
  }
};

export default class CovidVisualization extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      done: undefined,
      loading: false,
      options: [],
      selectedOption: this.props.type === 'country' ? 'Afghanistan' : 'alabama',
      data: [],
      formatted: [],
      partitions: []
    };
  }

  componentDidMount() {   
    setTimeout(() => {
      fetch("https://disease.sh/v3/covid-19/historical/usacounties")
        .then(response => response.json())
        .then(json => {
          this.setState({ loading: true });
          if (this.props.type === 'country') { 
            this.setState({ options: countries }, this.updateGraph);
          } else {
            this.setState({ options: json }, this.cleanStates);
          }
        });
    }, 2000);
  }

  cleanStates() { 
    this.setState({options: this.state.options.filter((each) => { 
      return !each.includes(" "); 
    })}, this.updateGraph);
  }

  handleChange(e) {
    e.preventDefault();
    this.setState({ done: false });
    this.setState({ selectedOption: e.target.value }, this.updateGraph);
  }

  updateGraph() {
    var parser = this.props.metric === "cases" ? this.parseCases : this.parseDeaths;
    parser = this.props.type === "country" ? this.parseCountry : parser;
    const baseUrl = this.props.type === "country" ? "https://disease.sh/v3/covid-19/historical/" : "https://disease.sh/v3/covid-19/historical/usacounties/";
    setTimeout(() => {
      fetch(baseUrl + this.state.selectedOption)
        .then(response => response.json())
        .then(json => {
          this.setState({ loading: true });
          this.setState({ data: json }, parser);
        });
    }, 1200);
  }

  parseCountry() {
    var cases = [];
    var deaths = [];
    var partitions = ["cases", "deaths"];
    var formatted = [];

    cases = this.state.data.timeline.cases;
    deaths = this.state.data.timeline.deaths;
    
    Object.keys(cases).forEach((key) => {
      var newDate = {};

      newDate.name = key;
      if (this.props.metric === 'cases') {
        newDate['cases'] = cases[key];
      } else {
        newDate['deaths'] = deaths[key];
      }

      formatted.push(newDate);
    });

    this.setState({ partitions: partitions })
    this.setState({ formatted: formatted }, this.markDone);
  }

  parseCases() {
    var cases = [];
    var partitions = []
    var formatted = [];

    this.state.data.forEach((item) => {
      cases.push(item.timeline.cases);
      partitions.push(item.county);
    });

    Object.keys(cases[0]).forEach(function (key) {
      var newDate = {};
      newDate.name = key;

      cases.forEach((element, index) => {
        var partition = partitions[index];
        newDate[partition] = element[key];
      });

      formatted.push(newDate);
    });

    this.setState({ partitions: partitions })
    this.setState({ formatted: formatted }, this.markDone);
  }

  parseDeaths() {
    var deaths = [];
    var partitions = []
    var formatted = [];

    this.state.data.forEach((item) => {
      deaths.push(item.timeline.deaths);
      partitions.push(item.county);
    });

    Object.keys(deaths[0]).forEach(function (key) {
      var newDate = {};
      newDate.name = key;

      deaths.forEach((element, index) => {
        var partition = partitions[index];
        newDate[partition] = element[key];
      });

      formatted.push(newDate);
    });

    this.setState({ partitions: partitions })
    this.setState({ formatted: formatted }, this.markDone);
  }

  markDone() {
    setTimeout(() => {
      this.setState({ done: true });
    }, 1000);
  }

  randomColor() {
    var randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return "#" + randomColor;
  }

  render() {
    return (
      <div>
        {!this.state.done ? (
          <FadeIn className='container loader'>
            <div>
              Fetching data
              {!this.state.loading ? (
                <Lottie options={defaultOptions} height={120} width={120} />
              ) : (
                  <Lottie options={defaultOptions2} height={120} width={120} />
                )}
            </div>
          </FadeIn>
        ) : (
            <div className='container'>
              <div className='chartTitle'>{this.props.metric.charAt(0).toUpperCase() + this.props.metric.slice(1)} by {this.props.type.charAt(0).toUpperCase() + this.props.type.slice(1)}</div>
              <div className='dd'>
              {this.props.type.charAt(0).toUpperCase() + this.props.type.slice(1)}:
                <select className='ddTitle' onChange={e => this.handleChange(e)} value={this.state.selectedOption}>
                  {this.state.options.map((id) => { return (<option key={id} value={id}>{id.charAt(0).toUpperCase() + id.slice(1)}</option>) })}
                </select>
              </div>

              <ResponsiveContainer className="container" width={600} aspect={2}>
                <LineChart
                  data={this.state.formatted}
                  margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                  }}>

                  <CartesianGrid strokeDasharray="1 1" />
                  <XAxis dataKey="name" tickLine={false}/>
                  <YAxis tickLine={false} />
                  <Tooltip itemSorter={item => (item.value) * (-1)}  wrapperStyle={{pointerEvents: 'auto'}}/>
                  {
                    this.state.partitions.map((id) => {
                      return (<Line key={id} dataKey={id} type="monotone" stroke={this.randomColor()} dot={false} />)
                    })
                  }
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
      </div>
    );
  }
}