import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'
import { setMessage, showLoading, hideLoading } from 'actions/appActions'
import { getChat } from 'actions/chatActions'

class Dashboard extends React.PureComponent {

  constructor(props){
    super(props)
    this.state = {
      messagesNumber: 0,
      currentPlan: {}
    }
  }

  async componentWillMount(){
     try{
      this.props.dispatch(showLoading())
      const { session } = this.props.auth
      this.setState({ currentPlan: session.plan })
      await this.props.dispatch(getChat({ where: { to: session.id } }))
      this.setState({ messagesNumber: this.props.chat.chats.records.length })
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    return (
      <div id="dashboard">
        <NavigationBar title={<h1>{this.context.t('dashboardTitle')}</h1>} description={<h2>{this.context.t('dashboardDescription')}</h2>} />
        <section className="row">
          <div className="col-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-center">Authentication Methods</h5>
                <h6><i className="fas fa-plug fa-2x"></i></h6>
                <p>Authentications methods allowed.</p>
                <button className="btn btn-outline-success" onClick={() => this.props.history.push('/app/user/profile')}>Go to Profile</button>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-center">Messages</h5>
                <h6><i className="fas fa-comment-alt fa-2x"></i></h6>
                <p>You have {this.state.messagesNumber} new messages.</p>
                <button className="btn btn-outline-success" onClick={() => this.props.history.push('/app/user/messages')}>Go to Messages</button>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-center">Plan</h5>
                <h6><i className="fa fa-credit-card fa-2x"></i></h6>
                <p>You are subscribed to {this.state.currentPlan.name}.</p>
                <button className="btn btn-outline-success" onClick={() => this.props.history.push('/app/user/subscription')}>Go to Subscription</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }
}

Dashboard.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    auth: state.auth,
    chat: state.chat,
    user: state.user
  }
}

export default connect(mapStateToProps)(Dashboard)
