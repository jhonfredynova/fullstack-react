import React from 'react'
import { InputGroupButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Pagination, PaginationItem, PaginationLink } from 'reactstrap'
import { defaultTo, set, setDeep, range } from 'lodash'
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
      await this.handleChangeState('query.activePage', 1)
    }
  }

  async handleChangeKeyword(value){
    if(value.indexOf('%')===-1) value = `%${value}%`
    let where = setDeep(this.state.query.where, 'like', value)
    await this.setState({ query: set(this.state.query, 'where', where) })
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
    const currentRange = Math.ceil(query.activePage/limitRange)
    const previousRange = currentRange>1 ? (currentRange*limitRange)-(limitRange-1) : 1
    const nextRange = previousRange+limitRange<=totalPages ? previousRange+limitRange : totalPages+1
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
          { !isLoading && !thereIsData && <div className="alert alert-warning">{this.context.t('thereIsNotData')}</div> }
          <div className={classnames({ 'text-center': true, 'd-none': !thereIsData })}>
            <Pagination maxbuttons={3} className="d-flex justify-content-center" size="md">
              <PaginationItem disabled={query.activePage<=1}>
                <PaginationLink previous href="#" onClick={() => this.handleChangeState('query.activePage', 1)} />
              </PaginationItem>
              <PaginationItem className={classnames({'d-none': previousRange<=1})}>
                <PaginationLink href="#" onClick={() => this.handleChangeState('query.activePage', (previousRange-limitRange))}>...</PaginationLink>
              </PaginationItem>
              {
                range(previousRange, nextRange).map(item =>
                  <PaginationItem key={item} active={item===query.activePage}>
                    <PaginationLink href="#" onClick={() => this.handleChangeState('query.activePage', item)}>{item}</PaginationLink>
                  </PaginationItem>
                )
              }
              <PaginationItem className={classnames({'d-none': nextRange>=totalPages})}>
                <PaginationLink href="#" onClick={() => this.handleChangeState('query.activePage', nextRange)}>...</PaginationLink>
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
