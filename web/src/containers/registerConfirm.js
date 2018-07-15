import { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { validateUser } from 'actions/userActions'

class RegisterConfirm extends Component {

  async componentWillMount(){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(validateUser({ token: this.props.match.params.token }))
      this.props.history.push('/')
      this.props.dispatch(setMessage({ type: 'success', message: this.props.user.temp.message }))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message, hideClose: true }))
      this.props.dispatch(hideLoading())
    }
  }

  render(){
    return null
  }
}

RegisterConfirm.contextTypes = {
  t: PropTypes.func.isRequired
}


function mapStateToProps(state) {
  return {
    app: state.app,
    user: state.user
  }
}

export default connect(mapStateToProps)(RegisterConfirm)
