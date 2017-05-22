import React, { Component } from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import './App.css';
import axios from 'axios';

var status = "Loading..."; // to display while API is being accessed
var googleData; // stores the results from the API search
var allNames = new Array(); // stores all the restaurant names from the API search, including rating and price
var markers = new Array(); // array of the markers on the map

// access the Google Maps Places API, save the info in allNames and markers
axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=38.0293,-78.4767&radius=500&type=restaurant&key=AIzaSyBY4xqlvGUeBVTT4SqkbZZV1IJUB8v8gnk')
  .then(function(response) {
    googleData = response.data.results;
    for (let val of googleData) {
      if (!val.price_level) {
        // change price to ??? if it couldn't be found
        val.price_level = "???";
      }
      allNames.push(val.name + ": Rating: " + val.rating + " Price: " + val.price_level + "/5");
      markers.push(
        <Marker position={[val.geometry.location.lat, val.geometry.location.lng]}>
          <Popup>
            <span> 
              {val.name} <br/> Rating: {val.rating} <br/> Price: {val.price_level}/5
            </span>
          </Popup>
        </Marker>
      );
    }
  })
  .catch(function (error) {
    // Display this status in case of an error
    status = "Error in API Request";
    console.log(error);
  });

class App extends Component {
  constructor() {
    super();
    this.state = {
      status: status,
      allRestNames: allNames,
      markers: markers
    }
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    // once the API search has finished, update state accordingly
    if (allNames.length !== 0) {
      this.setState({
        status: "Foodie Finder",
        allRestNames: allNames.map((n) =>
          <li key={n}>
            {n}
          </li>
        ),
        markers: markers
      });  
    } else {
      // if the API search fails, update the state to display the error message
      this.setState({
        status: status,
        allRestNames: allNames,
        markers: markers
      })
    }
  }
  
  render() {
    return (
      <div className="App">
        <h1 className="Status">
          {this.state.status}
        </h1>
        <ol className="List-rest-names"> 
          {this.state.allRestNames} 
        </ol>
        <Map center={[38.0293, -78.4767]} zoom={17}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
          />
          {markers}
        </Map>
      </div>
    );
  }
}

export default App;
