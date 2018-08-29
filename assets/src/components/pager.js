import React, { Component } from 'react'
import { DropdownButton, MenuItem, Pagination } from 'react-bootstrap'
import { defaultTo, isObject, set } from 'lodash'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import './pager.css'

class Pager extends Component {

  constructor(props) {
    super(props)
    this.state = { 
      activePage: defaultTo(this.props.data.activePage, 1),
      pageSize: defaultTo(this.props.data.pageSize, 10),
      select: defaultTo(this.props.data.select, null),
      sort: defaultTo(this.props.data.sort, null),
      where: defaultTo(this.props.data.where, null)
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data)
  }

  async handleChangeState(path, value){
    await this.setState(set(this.state, path, value))
    this.handleChangeSearch()
  }

  async handleKeyPressKeyword(e){
    if(e.key==='Enter'){
      await this.setState({ activePage: 1 })
    }
  }

  async handleChangeKeyword(value){
    if(value.indexOf('%')===-1) value = `%${value}%`
    let where = this.state.where
    let setKeyword = (object, property, value) => {
      for(let key in object) {
        if(isObject(object[key])) object[key] = setKeyword(object[key], property, value)
        if(key===property) object[key] = value
      }
      return object
    }
    where = setKeyword(where, 'like', value)
    await this.setState(set(this.state, 'where', where))
  }

  async handleChangeSearch(e){
    if(e) e.preventDefault()
    this.props.onChange(this.state)
  }
    
  render() {
    const { records, recordsTotal } = this.props.items
    const thereIsData = records.length>0
    return (
      <div id="pager" className={this.props.className}>
        <div className="help-block"></div>
        <form onSubmit={this.handleChangeSearch.bind(this)}> 
          <div className='form-group input-group'>
            <input type="text" className="form-control" placeholder="Search" onChange={e => this.handleChangeKeyword(e.target.value)} onKeyPress={this.handleKeyPressKeyword.bind(this)} />
            <span className="input-group-btn">
              <DropdownButton id={'cbPageSize'} title={this.state.pageSize} onSelect={value => this.handleChangeState('pageSize', value)} pullRight>
                <MenuItem eventKey={5}>5</MenuItem>
                <MenuItem eventKey={10}>10</MenuItem>
                <MenuItem eventKey={15}>15</MenuItem>
                <MenuItem eventKey={20}>20</MenuItem>
              </DropdownButton>
              <button type="submit" className="btn btn-success"><i className="glyphicon glyphicon-search"></i></button>
            </span>
          </div>
        </form>
        <section className={classnames({ 'hide': this.props.isLoading })}>
          { thereIsData ?  this.props.children : null }
          <div className={classnames({ 'alert alert-warning': true, 'hide': thereIsData })}>{this.context.t('thereIsNotData')}</div>
          <div className={classnames({ 'text-center': true, 'hide': !thereIsData })}>
            <Pagination bsClass="pagination" bsSize="medium" prev next ellipsis boundaryLinks maxButtons={3} items={Math.ceil(recordsTotal/this.state.pageSize)} activePage={this.state.activePage} onSelect={value => this.handleChangeState('activePage', value)} />
          </div>
        </section>
      </div>
    )
  }
}

Pager.contextTypes = {
  t: PropTypes.func.isRequired
}

export default Pager
