import React, { Component } from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import Sidebar from "react-sidebar"
import InfiniteScroll from 'react-infinite-scroll-component'
import { set } from 'lodash'
import ChatNewMessage from 'components/chatNewMessage'
import NavigationBar from 'components/navigationBar'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getBilling } from 'actions/paymentActions'
import 'containers/app/user/chat.css'
const sidebarMql = window.matchMedia(`(min-width: 768px)`)

class Chat extends Component {

  constructor(props){
    super(props)
    const { session } = this.props.auth
    this.handleMediaQuery = this.handleMediaQuery.bind(this)
    this.handlePressKey = this.handlePressKey.bind(this);
    this.state = {
      sidebarDocked: sidebarMql.matches,
      sidebarMql: sidebarMql,
      sidebarOpen: false,
      showChatNewMessage: false,
      chats: this.props.payment.billing,//this.props.chat.chats,
      chatQuery: {
        pageSize: 10,
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
      this.state.sidebarMql.addListener(this.handleMediaQuery)
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
      this.state.sidebarMql.removeListener(this.handleMediaQuery)
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
      this.setState({ sidebarDocked: this.state.sidebarMql.matches, sidebarOpen: false });
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
      await this.setState({ chatQuery: Object.assign(this.state.chatQuery, { pageSize: this.state.chatQuery.pageSize+5 }) })
      //await this.props.dispatch(getChat(this.state.chatQuery))
      await this.props.dispatch(getBilling(this.state.chatQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    const { records, recordsTotal } = this.state.chats    
    const chatHasMore = records.length+1<recordsTotal     
    const chatLoader = (<div className="text-center"><i className="fa fa-spinner fa-spin fa-2x"></i></div>)
    const chatConversations = (
      <div className="panel panel-default">
        <div className="panel-heading">
          <span className="pull-left"><h2>{this.context.t('messages')}</h2></span>
          <span className="pull-right"><button className="btn btn-success"><i className="glyphicon glyphicon-edit" /></button></span>
          <span className="clearfix" />
        </div>
        <div id="chatBody" className="panel-body">
          <InfiniteScroll scrollableTarget={'chatBody'} hasMore={chatHasMore} next={this.handleChangeSearch.bind(this)} loader={chatLoader}> 
            {
              records.map((item, index) => 
                <p key={item.id} className="alert alert-info">{item.orderId}</p>
              )
            }
          </InfiniteScroll>
        </div>
      </div>
    )
    return (
      <div id="chat">
        <Sidebar rootClassName='sidebarRoot' sidebarClassName='sidebar' contentClassName='sidebarContent' overlayClassName='sidebarOverlay' docked={this.state.sidebarDocked} sidebar={chatConversations} open={this.state.sidebarOpen} onSetOpen={() => this.handleChangeState('sidebarOpen',false)}>
          <NavigationBar data={{ title: <h1>{this.context.t('chatTitle')}</h1>, subTitle: <h2>{this.context.t('chatDescription')}</h2>, btnLeft: (this.state.sidebarDocked ? null : <button className="btn btn-success" onClick={() => this.handleChangeState('sidebarOpen', !this.state.sidebarOpen)}><i className="glyphicon glyphicon-chevron-right" /></button>) }} />
          <div className="text-center">
            <h1><i className="fa fa-comments-o fa-2x" /></h1>
            <p className={classnames({'hide': !this.state.showChatNewMessage})}>{this.context.t('chatEmpty')}</p>
            <ChatNewMessage className={classnames({'hide': this.state.showChatNewMessage})} data={{}} />
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
