import React from 'react'
import { InputGroupButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Pagination, PaginationItem, PaginationLink } from 'reactstrap'
import { defaultTo, isObject, set, range } from 'lodash'
import classnames from 'classnames'
import PropTypes from 'prop-types'

class Pager extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = { 
      query: {
        activePage: defaultTo(this.props.query.activePage, 1),
        pageSize: defaultTo(this.props.query.pageSize, 10),
        select: defaultTo(this.props.query.select, null),
        sort: defaultTo(this.props.query.sort, null),
        where: defaultTo(this.props.query.where, null)
      },
      showDropdownPageSize: false
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps)
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
    let where = this.state.query.where
    let setKeyword = (object, property, value) => {
      for(let key in object) {
        if(isObject(object[key])) object[key] = setKeyword(object[key], property, value)
        if(key===property) object[key] = value
      }
      return object
    }
    where = setKeyword(where, 'like', value)
    await this.setState(set(this.state.query, 'where', where))
  }

  async handleChangeSearch(e){
    if(e) e.preventDefault()
    this.props.onChange(this.state.query)
  }
    
  render() {
    const { query, showDropdownPageSize } = this.state
    const { isLoading } = this.props
    const { records, totalRecords } = this.props.items
    const totalPages = Math.ceil(totalRecords/query.pageSize)
    const limitRange = 3
    const previousRange = query.activePage-limitRange>0 ? query.activePage-limitRange : 1
    const nextRange = query.activePage+limitRange<=totalPages ? query.activePage+limitRange : totalPages
    const thereIsData = records.length>0
    return (
      <div id="pager" className={this.props.className}>
        <div className="help-block"></div>
        <form onSubmit={this.handleChangeSearch.bind(this)}> 
          <div className='form-group input-group'>
            <input type="text" className="form-control" placeholder="Search" onChange={e => this.handleChangeKeyword(e.target.value)} onKeyPress={this.handleKeyPressKeyword.bind(this)} />
            <InputGroupButtonDropdown addonType="append" isOpen={showDropdownPageSize} toggle={() => this.setState({ showDropdownPageSize: !showDropdownPageSize })}>              
              <DropdownToggle className="rounded-0" outline caret>{query.pageSize}</DropdownToggle>
              <DropdownMenu right>
                <DropdownItem active={query.pageSize===5} onClick={() => this.handleChangeState('query.pageSize', 5)}>5</DropdownItem>
                <DropdownItem active={query.pageSize===10} onClick={() => this.handleChangeState('query.pageSize', 10)}>10</DropdownItem>
                <DropdownItem active={query.pageSize===15} onClick={() => this.handleChangeState('query.pageSize', 15)}>15</DropdownItem>
                <DropdownItem active={query.pageSize===20} onClick={() => this.handleChangeState('query.pageSize', 20)}>20</DropdownItem>
              </DropdownMenu>
              <button type="submit" className="btn btn-success"><i className="fas fa-search"></i></button>
            </InputGroupButtonDropdown>
          </div>
        </form>
        <section>
          { thereIsData && this.props.children }
          <div className={classnames({ 'alert alert-warning': true, 'd-none': (isLoading || thereIsData) })}>{this.context.t('thereIsNotData')}</div>
          <div className={classnames({ 'text-center': true, 'd-none': !thereIsData })}>
            <Pagination maxbuttons={3} className="d-flex justify-content-center" size="md">
              <PaginationItem disabled={query.activePage<=1}>
                <PaginationLink previous href="#" onClick={() => this.handleChangeState('query.activePage', 1)} />
              </PaginationItem>
              <PaginationItem className={classnames({'d-none': previousRange<=1})}>
                <PaginationLink href="#" onClick={() => this.handleChangeState('query.activePage', (query.activePage-limitRange))}>...</PaginationLink>
              </PaginationItem>
              {
                range(query.activePage, nextRange).map(item =>
                  <PaginationItem key={item} active={item===query.activePage}>
                    <PaginationLink href="#" onClick={() => this.handleChangeState('query.activePage', item)}>{item}</PaginationLink>
                  </PaginationItem>
                )
              }
              <PaginationItem className={classnames({'d-none': previousRange>=totalPages})}>
                <PaginationLink href="#" onClick={() => this.handleChangeState('query.activePage', (query.activePage+limitRange))}>...</PaginationLink>
              </PaginationItem>
              <PaginationItem disabled={query.activePage>=totalPages}>
                <PaginationLink next href="#" onClick={() => this.handleChangeState('query.activePage', totalPages)} />
              </PaginationItem>
            </Pagination>
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
