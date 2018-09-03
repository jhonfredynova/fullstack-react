import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import Sidebar from "react-sidebar"
import NavigationBar from 'components/navigationBar'
import Pager from 'components/pager'
import { set } from 'lodash'
import { hideLoading, showLoading, setMessage, setPreference, PREFERENCE } from 'actions/appActions'
import { getBilling } from 'actions/paymentActions'
import 'containers/app/user/chat.css'
const sidebarMql = true//window.matchMedia(`(min-width: 768px)`)

class Chat extends Component {

  constructor(props){
    super(props)
    const { session } = this.props.auth
    const { appPreferences } = this.props.app.config
    this.handleMediaQuery = this.handleMediaQuery.bind(this)
    this.handlePressKey = this.handlePressKey.bind(this);
    this.state = {
      sidebarDocked: sidebarMql.matches,
      sidebarOpen: false,
      chats: this.props.payment.billing,//this.props.chat.chats,
      chatQuery: {
        template: 'scroll',
        pageSize: appPreferences[PREFERENCE.ADMIN_PAGINATION],
        //select: ['updatedAt','id','from'],
        sort: [
          { updatedAt: 'DESC' }
        ],
        where: {
          clientCode: session.clientCode,
          //to: session.id
        }
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      chats: nextProps.payment.billing//nextProps.chat.chats
    })
  }

  async componentWillMount(){
    try{
      this.props.dispatch(showLoading())
      sidebarMql.addListener(this.handleMediaQuery)
      document.addEventListener('keydown', this.handlePressKey, false)
      window.dispatchEvent(new Event('resize'))
      //await this.props.dispatch(getChat(this.state.chatQuery))
      await this.props.dispatch(getBilling(this.state.chatQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  componentWillUnmount() {
    try{
      sidebarMql.removeListener(this.handleMediaQuery)
      document.removeEventListener('keydown', this.handlePressKey, false);
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChangeState(path, value){
    this.setState(set(this.state, path, value))
  }

  async handleMediaQuery(){
    try{
      this.setState({ sidebarDocked: sidebarMql.matches, sidebarOpen: false });
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handlePressKey(e){
    try{
      if(e.keyCode===27) {
        this.setState({ sidebarOpen: false })
      }
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChangeSearch(data){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(setPreference({ [PREFERENCE.ADMIN_PAGINATION]: data.pageSize }))
      await this.setState({ chatQuery: Object.assign(this.state.chatQuery, data) })
      //await this.props.dispatch(getChat(this.state.chatQuery))
      await this.props.dispatch(getBilling(this.state.chatQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    const { isLoading } = this.props.app
    const { records } = this.state.chats
    const chatConversations = (
      <Pager isLoading={isLoading} data={this.state.chatQuery} items={this.state.chats} onChange={this.handleChangeSearch.bind(this)}>
        {
          records.map((item, index) => 
            <p className="alert alert-info">{item.orderId}</p>
          )
        }
      </Pager>
    )
    return (
      <div id="chat">
        <Sidebar rootClassName='sidebarRoot' sidebarClassName='sidebar' contentClassName='sidebarContent' overlayClassName='sidebarOverlay' docked={this.state.sidebarDocked} sidebar={chatConversations} open={this.state.sidebarOpen} onSetOpen={() => this.handleChangeState('sidebarOpen',false)}>
          <NavigationBar data={{ title: <h1>{this.context.t('chatTitle')}</h1>, subTitle: <h2>{this.context.t('chatDescription')}</h2>, btnLeft: <button className={classnames({"btn btn-success": true, "hide": this.state.sidebarDocked})} onClick={() => this.handleChangeState('sidebarOpen', !this.state.sidebarOpen)}><i className="glyphicon glyphicon-chevron-right" /></button> }} />
          <div className="text-center">
            <h1><i className="fa fa-comments-o fa-2x" /></h1>
            <p>{this.context.t('chatEmpty')}</p>
          </div>
        </Sidebar>
      </div>
    )
  }
}

Chat.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    auth: state.auth,
    chat: state.chat,
    payment: state.payment
  }
}

export default connect(mapStateToProps)(Chat)
