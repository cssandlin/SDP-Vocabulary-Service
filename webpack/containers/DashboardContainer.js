import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchStats } from '../actions/landing';
import { setSteps } from '../actions/tutorial_actions';
import { fetchSearchResults, fetchMoreSearchResults } from '../actions/search_results_actions';
import DashboardSearch from '../components/DashboardSearch';
import SignUpModal from '../components/accounts/SignUpModal';
import SearchResultList from '../components/SearchResultList';
import currentUserProps from '../prop-types/current_user_props';
import { surveillanceSystemsProps }from '../prop-types/surveillance_system_props';
import { surveillanceProgramsProps } from '../prop-types/surveillance_program_props';
import { signUp } from '../actions/current_user_actions';
import _ from 'lodash';

class DashboardContainer extends Component {
  constructor(props){
    super(props);
    this.search = this.search.bind(this);
    this.setFiltersParent = this.setFiltersParent.bind(this);
    this.selectType = this.selectType.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.openSignUpModal = this.openSignUpModal.bind(this);
    this.closeSignUpModal = this.closeSignUpModal.bind(this);
    this.addSteps = this.addSteps.bind(this);
    this.state = {
      searchType: '',
      searchTerms: '',
      progFilters: [],
      sysFilters: [],
      signUpOpen: false,
      myStuffFilter: false,
      page: 1
    };
  }

  componentWillMount() {
    this.props.fetchStats();
    this.search('');
  }

  componentDidMount() {
    this.addSteps([
    {
      title: 'Help',
      text: 'Click next to see a step by step walkthrough for using this page.',
      selector: '.help-link',
      position: 'bottom',
    },
    {
      title: 'Dashboard Search',
      text: 'Type in your search term and search across all items by default. Results include items you own and published items.',
      selector: '.search-group',
      position: 'right',
    },
    {
      title: 'Type Filters',
      text: 'Click on any of the type boxes to highlight them and toggle on filtering by that single item type.',
      selector: '.analytics-list-group',
      position: 'right',
    },
    {
      title: 'Advanced Search Filters',
      text: 'Click Advanced Link to see additional filters you can apply to your search.',
      selector: '.adv-search-link',
      position: 'right',
    }]);
  }

  componentDidUpdate(_prevProps, prevState) {
    if(prevState != this.state && prevState.page === this.state.page) {
      let searchType = this.state.searchType;
      let searchTerms = this.state.searchTerms;
      if(searchType === '') {
        searchType = null;
      }
      if(searchTerms === ''){
        searchTerms = null;
      }
      this.props.fetchSearchResults(searchTerms, searchType, this.state.progFilters, this.state.sysFilters, this.state.myStuffFilter);
    }
  }

  render() {
    let loggedIn = ! _.isEmpty(this.props.currentUser);
    const searchResults = this.props.searchResults;
    return (
      <div className="container-fluid">
        {!loggedIn &&
          <div className="row">
            <SignUpModal signUp={this.props.signUp} show={this.state.signUpOpen}
              closer={() => this.closeSignUpModal()}
              surveillanceSystems={this.props.surveillanceSystems}
              surveillancePrograms={this.props.surveillancePrograms} />
            <div className="cdc-jumbotron">
              <div className="container">
                <div className="row">
                  <div className="col-md-12">
                    <div className="col-md-8">
                      <div className="cdc-promo-banner">
                        <h1 className="banner-title">CDC Vocabulary Service</h1>
                        <h3>Author Questions, Response Sets, and Forms</h3>
                        <p className="lead">The Vocabulary Service allows users to author their own questions and response sets, and to reuse others’ wording for their new data collection needs when applicable. A goal of this service is to increase consistency by reducing the number of different ways that CDC asks for similar information, lowering the reporting burden on partners.</p>
                        <p><a className="btn btn-lg btn-success" href="#" role="button" onClick={this.openSignUpModal}>Get Started!</a></p>
                      </div>
                    </div>
                    <div className="col-md-4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        <div className="container">
          <div className="row dashboard">
            <div className={loggedIn ? ("col-md-8") : ("col-md-12")}>
              <div className="dashboard-details">
                <DashboardSearch search={this.search} surveillanceSystems={this.props.surveillanceSystems}
                                 surveillancePrograms={this.props.surveillancePrograms}
                                 setFiltersParent={this.setFiltersParent}
                                 searchSource={this.props.searchResults.Source} />
                <div className="row">
                  <div className="col-md-12">
                    {this.analyticsGroup(this.state.searchType)}
                  </div>
                </div>
                <div className="load-more-search">
                  <SearchResultList searchResults={this.props.searchResults} currentUser={this.props.currentUser} isEditPage={false} />
                  {searchResults.hits && searchResults.hits.total > 0 && this.state.page <= Math.floor(searchResults.hits.total / 10) &&
                    <div id="load-more-btn" className="button button-action center-block" onClick={() => this.loadMore()}>LOAD MORE</div>
                  }
                </div>
              </div>
            </div>
            {loggedIn &&
              <div className="col-md-4">
                <div className="dashboard-activity">
                  {this.authorStats(this.state.searchType, this.state.myStuffFilter)}
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }

  openSignUpModal() {
    this.setState({signUpOpen: true});
  }

  closeSignUpModal() {
    this.setState({signUpOpen: false});
  }

  loadMore() {
    let searchType = this.state.searchType;
    let searchTerms = this.state.searchTerms;
    let tempState = this.state.page + 1;
    if(this.state.searchType === '') {
      searchType = null;
    }
    if(this.state.searchTerms === '') {
      searchTerms = null;
    }
    this.props.fetchMoreSearchResults(searchTerms, searchType, tempState,
                                      this.state.progFilters,
                                      this.state.sysFilters,
                                      this.state.myStuffFilter);
    this.setState({page: tempState});
  }

  setFiltersParent(newState) {
    this.setState(newState);
  }

  search(searchTerms, progFilters, sysFilters) {
    let searchType = null;
    if(this.state.searchType !== '') {
      searchType = this.state.searchType;
    }
    if(searchTerms === ''){
      searchTerms = null;
    }
    this.setState({searchTerms: searchTerms, progFilters: progFilters, sysFilters: sysFilters});
    this.props.fetchSearchResults(searchTerms, searchType, progFilters, sysFilters, this.state.myStuffFilter);
  }

  addSteps(steps) {
    let newSteps = steps;
    if (!Array.isArray(newSteps)) {
      newSteps = [newSteps];
    }
    if (!newSteps.length) {
      return;
    }

    this.props.setSteps(newSteps);
  }

  selectType(searchType, myStuffToggle=false) {
    let searchTerms = null;
    let myStuffFilter = false;
    if(this.state.searchTerms !== '') {
      searchTerms = this.state.searchTerms;
    }
    if(myStuffToggle) {
      if(this.state.searchType === searchType && this.state.myStuffFilter) {
        myStuffFilter = false;
        this.setState({myStuffFilter: false});
      } else {
        myStuffFilter = true;
        this.setState({myStuffFilter: true});
      }
    } else {
      myStuffFilter = false;
      this.setState({myStuffFilter: false});
    }
    if(this.state.searchType === searchType && !(myStuffToggle && !this.state.myStuffFilter)) {
      this.setState({searchType: '', page: 1});
      searchType = null;
    } else {
      this.setState({searchType: searchType, page: 1});
    }
    if(searchType === '') {
      searchType = null;
    }
    this.props.fetchSearchResults(searchTerms, searchType, this.state.progFilters, this.state.sysFilters, myStuffFilter);
  }

  analyticsGroup(searchType) {
    return (
    <div className="analytics-group">
      <ul className="analytics-list-group">
        <li id="questions-analytics-item" className={"analytics-list-item btn" + (searchType === 'question' ? " analytics-active-item" : "")} onClick={() => this.selectType('question')}>
          <div>
            <i className="fa fa-tasks fa-3x item-icon" aria-hidden="true"></i>
            <p className="item-value">{this.props.questionCount}</p>
            <h2 className="item-title">Questions</h2>
          </div>
        </li>
        <li id="response-sets-analytics-item" className={"analytics-list-item btn" + (searchType === 'response_set' ? " analytics-active-item" : "")} onClick={() => this.selectType('response_set')}>
          <div>
            <i className="fa fa-list fa-3x item-icon" aria-hidden="true"></i>
            <p className="item-value">{this.props.responseSetCount}</p>
            <h2 className="item-title">Response Sets</h2>
          </div>
          </li>
        <li id="forms-analytics-item" className={"analytics-list-item btn" + (searchType === 'form' ? " analytics-active-item" : "")} onClick={() => this.selectType('form')}>
          <div>
            <i className="fa fa-list-alt fa-3x item-icon" aria-hidden="true"></i>
            <p className="item-value">{this.props.formCount}</p>
            <h2 className="item-title">Forms</h2>
          </div>
          </li>
        <li id="surveys-analytics-item" className={"analytics-list-item btn" + (searchType === 'survey' ? " analytics-active-item" : "")} onClick={() => this.selectType('survey')}>
          <div>
            <i className="fa fa-clipboard fa-3x item-icon" aria-hidden="true"></i>
            <p className="item-value">{this.props.surveyCount}</p>
            <h2 className="item-title">Surveys</h2>
          </div>
          </li>
      </ul>
      {searchType != '' && <a href="#" onClick={() => this.selectType(searchType)}>Clear Type Filter</a>}
    </div>);
  }

  authorStats(searchType, myStuffFilter) {
    return (
      <div className="recent-items-panel">
        <div className="recent-items-heading">My Stuff</div>
        <div className="recent-items-body">
          <ul className="list-group">
            <li className={"recent-item-list btn" + (searchType === 'question' && myStuffFilter ? " analytics-active-item" : "")} onClick={() => this.selectType('question', true)}>
              <div className="recent-items-icon"><i className="fa fa-tasks recent-items-icon" aria-hidden="true"></i></div>
              <div className="recent-items-value">{this.props.myQuestionCount} Questions</div>
            </li>
            <li className={"recent-item-list btn" + (searchType === 'response_set' && myStuffFilter ? " analytics-active-item" : "")} onClick={() => this.selectType('response_set', true)}>
              <div className="recent-items-icon"><i className="fa fa-list recent-items-icon" aria-hidden="true"></i></div>
              <div className="recent-items-value">{this.props.myResponseSetCount} Response Sets</div>
            </li>
            <li className={"recent-item-list btn" + (searchType === 'form' && myStuffFilter ? " analytics-active-item" : "")} onClick={() => this.selectType('form', true)}>
              <div className="recent-items-icon"><i className="fa fa-list-alt recent-items-icon" aria-hidden="true"></i></div>
              <div className="recent-items-value">{this.props.myFormCount} Forms</div>
            </li>
            <li className={"recent-item-list btn" + (searchType === 'survey' && myStuffFilter ? " analytics-active-item" : "")} onClick={() => this.selectType('survey', true)}>
              <div className="recent-items-icon"><i className="fa fa-clipboard recent-items-icon" aria-hidden="true"></i></div>
              <div className="recent-items-value">{this.props.mySurveyCount} Surveys</div>
            </li>
            {myStuffFilter ? (<a href="#" className="col-md-12 text-center" onClick={() => this.selectType(searchType)}>Clear My Stuff Filter</a>) : (
              <a href="#" className="col-md-12 text-center" onClick={() => this.selectType(searchType, true)}>Filter by My Stuff</a>
            )}
          </ul>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    formCount: state.stats.formCount,
    questionCount: state.stats.questionCount,
    responseSetCount: state.stats.responseSetCount,
    surveyCount: state.stats.surveyCount,
    myFormCount: state.stats.myFormCount,
    myQuestionCount: state.stats.myQuestionCount,
    myResponseSetCount: state.stats.myResponseSetCount,
    mySurveyCount: state.stats.mySurveyCount,
    searchResults: state.searchResults,
    surveillanceSystems: state.surveillanceSystems,
    surveillancePrograms: state.surveillancePrograms,
    currentUser: state.currentUser
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({fetchStats, setSteps, fetchSearchResults, fetchMoreSearchResults, signUp}, dispatch);
}

DashboardContainer.propTypes = {
  formCount: PropTypes.number,
  questionCount: PropTypes.number,
  responseSetCount: PropTypes.number,
  surveyCount: PropTypes.number,
  myFormCount: PropTypes.number,
  myQuestionCount: PropTypes.number,
  myResponseSetCount: PropTypes.number,
  mySurveyCount: PropTypes.number,
  fetchStats: PropTypes.func,
  setSteps: PropTypes.func,
  fetchSearchResults: PropTypes.func,
  fetchMoreSearchResults: PropTypes.func,
  signUp: PropTypes.func,
  currentUser: currentUserProps,
  searchResults: PropTypes.object,
  surveillanceSystems: surveillanceSystemsProps,
  surveillancePrograms: surveillanceProgramsProps
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer);
