import React from 'react'
import NavigationBar from 'components/navigationBar'

class Dashboard extends React.PureComponent {
  render() {
    return (
      <div id="dashboard">
        <NavigationBar title={<h1>Dashboard</h1>} />
      </div>
    )
  }
}

export default Dashboard
