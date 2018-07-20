import React, { Component } from 'react'
import NavigationBar from 'components/navigationBar'

class Dashboard extends Component {
  render() {
    return (
      <div id="dashboard">
        <NavigationBar data={{ title: <h1>Dashboard</h1> }} />
      </div>
    )
  }
}

export default Dashboard
