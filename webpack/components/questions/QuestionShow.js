import React, { Component } from 'react';
import PropTypes from 'prop-types';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import { hashHistory, Link } from 'react-router';

import VersionInfo from "../VersionInfo";
import ResponseSetList from "../response_sets/ResponseSetList";
import SectionList from "../sections/SectionList";
import CodedSetTable from "../CodedSetTable";
import ProgramsAndSystems from "../shared_show/ProgramsAndSystems";
import PublisherLookUp from "../shared_show/PublisherLookUp";
import ChangeHistoryTab from "../shared_show/ChangeHistoryTab";
import GroupLookUp from "../shared_show/GroupLookUp";
import TagModal from "../TagModal";

import { questionProps } from "../../prop-types/question_props";
import currentUserProps from "../../prop-types/current_user_props";
import { publishersProps } from "../../prop-types/publisher_props";

import { isEditable, isRevisable, isPublishable, isExtendable, isGroupable, isSimpleEditable } from '../../utilities/componentHelpers';

export default class QuestionShow extends Component {
  constructor(props) {
    super(props);
    this.state = { tagModalOpen: false, selectedTab: 'main' };
  }

  render() {
    const {question} = this.props;
    if(question === undefined || question.content === undefined){
      return (<div>Loading...</div>);
    }

    return (
      <div id={"question_id_"+question.id}>
        <div className="showpage_header_container no-print">
          <ul className="list-inline">
            <li className="showpage_button"><span className="fa fa-arrow-left fa-2x" aria-hidden="true" onClick={hashHistory.goBack}></span></li>
            <li className="showpage_title"><h1>Question Details {question.status && (<text>[{question.status.toUpperCase()}]</text>)}</h1></li>
          </ul>
        </div>
        {this.historyBar(question)}
        {this.mainContent(question)}
      </div>
    );
  }

  reviseQuestionButton(){
    if(this.props.currentUser && this.props.currentUser.id && this.props.question && this.props.question.mostRecent == this.props.question.version){
      if(this.props.question.status && this.props.question.status == 'draft'){
        return( <Link className="btn btn-primary" to={`/questions/${this.props.question.id}/edit`}>Edit</Link> );
      } else {
        return( <Link className="btn btn-primary" to={`/questions/${this.props.question.id}/revise`}>Revise</Link> );
      }
    }
  }

  extendQuestionButton() {
    if(this.props.currentUser && this.props.currentUser.id && this.props.question && this.props.question.mostRecent == this.props.question.version){
      if(this.props.question.status && this.props.question.status == 'published'){
        return( <Link to={`/questions/${this.props.question.id}/extend`} className="btn btn-primary">Extend</Link> );
      }
    }
  }

  mainContent(question) {
    return (
      <div className="col-md-9 nopadding maincontent">
        {this.props.currentUser && this.props.currentUser.id &&
          <div className="action_bar no-print">
            {isEditable(question, this.props.currentUser) &&
              <PublisherLookUp publishers={this.props.publishers}
                             itemType="Question" />
            }
            {isGroupable(question, this.props.currentUser) &&
              <GroupLookUp item={question} addFunc={this.props.addQuestionToGroup} removeFunc={this.props.removeQuestionFromGroup} currentUser={this.props.currentUser} />
            }
            {isRevisable(question, this.props.currentUser) &&
              <Link className="btn btn-primary" to={`/questions/${this.props.question.id}/revise`}>Revise</Link>
            }
            {isEditable(question, this.props.currentUser) &&
              <Link className="btn btn-primary" to={`/questions/${this.props.question.id}/edit`}>Edit</Link>
            }
            {isExtendable(question, this.props.currentUser) &&
              <Link to={`/questions/${this.props.question.id}/extend`} className="btn btn-primary">Extend</Link>
            }
            {isPublishable(question, this.props.currentUser) &&
              <button className="btn btn-primary" onClick={() => this.props.handlePublish(question) }>Publish</button>
            }
            {isEditable(question, this.props.currentUser) &&
              <a className="btn btn-default" href="#" onClick={(e) => {
                e.preventDefault();
                if(confirm('Are you sure you want to delete this Question? This action cannot be undone.')){
                  this.props.deleteQuestion(question.id, (response) => {
                    if (response.status == 200) {
                      let stats = Object.assign({}, this.props.stats);
                      stats.questionCount = this.props.stats.questionCount - 1;
                      stats.myQuestionCount = this.props.stats.myQuestionCount - 1;
                      this.props.setStats(stats);
                      this.props.router.push('/');
                    }
                  });
                }
                return false;
              }}>Delete</a>
            }
          </div>
        }
        <div className="maincontent-details">
          <h1 className="maincontent-item-name"><strong>Question Name:</strong> {question.content} </h1>
          <p className="maincontent-item-info">Version: {question.version} - Author: {question.createdBy && question.createdBy.email} </p>
          <ul className="nav nav-tabs" role="tablist">
            <li id="main-content-tab" className="nav-item active" role="tab" onClick={() => this.setState({selectedTab: 'main'})} aria-selected={this.state.selectedTab === 'main'} aria-controls="main">
              <a className="nav-link" data-toggle="tab" href="#main-content" role="tab">Information</a>
            </li>
            <li id="change-history-tab" className="nav-item" role="tab" onClick={() => this.setState({selectedTab: 'changes'})} aria-selected={this.state.selectedTab === 'changes'} aria-controls="changes">
              <a className="nav-link" data-toggle="tab" href="#change-history" role="tab">Change History</a>
            </li>
          </ul>
          <div className="tab-content">
            <div className={`tab-pane ${this.state.selectedTab === 'changes' && 'active'}`} id="changes" role="tabpanel" aria-hidden={this.state.selectedTab !== 'changes'} aria-labelledby="change-history-tab">
              <ChangeHistoryTab versions={question.versions} type='question' majorVersion={question.version} />
            </div>
            <div className={`tab-pane ${this.state.selectedTab === 'main' && 'active'}`} id="main" role="tabpanel" aria-hidden={this.state.selectedTab !== 'main'} aria-labelledby="main-content-tab">
              <div className="basic-c-box panel-default question-type">
                <div className="panel-heading">
                  <h2 className="panel-title">Details</h2>
                </div>
                <div className="box-content">
                  <strong>Description: </strong>
                  {question.description}
                </div>
                <div className="box-content">
                  <strong>Created: </strong>
                  { format(parse(question.createdAt,''), 'MMMM Do YYYY, h:mm:ss a') }
                </div>
                { question.parent &&
                  <div className="box-content">
                    <strong>Extended from: </strong>
                    <Link to={`/questions/${question.parent.id}`}>{ question.parent.name || question.parent.content }</Link>
                  </div>
                }
                { question.status === 'published' && question.publishedBy && question.publishedBy.email &&
                <div className="box-content">
                  <strong>Published By: </strong>
                  {question.publishedBy.email}
                </div>
                }
                {question.category && <div className="box-content">
                  <strong>Category: </strong>
                  {question.category.name && question.category.name}
                </div>}
                {question.subcategory && <div className="box-content">
                  <strong>Subcategory: </strong>
                  {question.subcategory.name && question.subcategory.name}
                </div>}
                {question.responseType && <div className="box-content">
                  <strong>Response Type: </strong>
                  {question.responseType.name && question.responseType.name}
                </div>}
                {question.responseType && question.responseType.code === 'choice' && <div className="box-content">
                  <strong>Other Allowed: </strong>
                  {question.otherAllowed ? 'Yes' : 'No' }
                </div>}
              </div>
                <div className="basic-c-box panel-default">
                  <div className="panel-heading">
                    <h2 className="panel-title">
                      Tags
                      {isSimpleEditable(question, this.props.currentUser) &&
                        <a className="pull-right tag-modal-link" href="#" onClick={(e) => {
                          e.preventDefault();
                          this.setState({ tagModalOpen: true });
                        }}>
                          <TagModal show={this.state.tagModalOpen || false}
                            cancelButtonAction={() => this.setState({ tagModalOpen: false })}
                            concepts={question.concepts}
                            saveButtonAction={(conceptsAttributes) => {
                              this.props.updateQuestionTags(question.id, conceptsAttributes);
                              this.setState({ tagModalOpen: false });
                            }} />
                          <i className="fa fa-pencil-square-o" aria-hidden="true"></i> Update
                        </a>
                      }
                    </h2>
                  </div>
                  <div className="box-content">
                    <div id="concepts-table">
                      <CodedSetTable items={question.concepts} itemName={'Tag'} />
                    </div>
                  </div>
                </div>
              {question.responseSets && question.responseSets.length > 0 &&
                <div className="basic-c-box panel-default">
                  <div className="panel-heading">
                    <h2 className="panel-title">
                      <a className="panel-toggle" data-toggle="collapse" href="#collapse-rs"><i className="fa fa-bars" aria-hidden="true"></i>
                      <text className="sr-only">Click link to expand information about linked </text>Author Recommended Response Sets: {question.responseSets && question.responseSets.length}</a>
                    </h2>
                  </div>
                  <div className="box-content panel-collapse panel-details collapse panel-body" id="collapse-rs">
                    <ResponseSetList responseSets={question.responseSets} />
                  </div>
                </div>
              }
              {question.linkedResponseSets && question.linkedResponseSets.length > 0 &&
                <div className="basic-c-box panel-default">
                  <div className="panel-heading">
                    <h2 className="panel-title">
                      <a className="panel-toggle" data-toggle="collapse" href="#collapse-lrs"><i className="fa fa-bars" aria-hidden="true"></i>
                      <text className="sr-only">Click link to expand information about </text>Response Sets Linked on Sections: {question.linkedResponseSets && question.linkedResponseSets.length}</a>
                    </h2>
                  </div>
                  <div className="box-content panel-collapse panel-details collapse panel-body" id="collapse-lrs">
                    <ResponseSetList responseSets={question.linkedResponseSets} />
                  </div>
                </div>
              }
              {question.sections && question.sections.length > 0 &&
                <div className="basic-c-box panel-default">
                  <div className="panel-heading">
                    <h2 className="panel-title">
                      <a className="panel-toggle" data-toggle="collapse" href={`#collapse-linked-sections`}><i className="fa fa-bars" aria-hidden="true"></i>
                      <text className="sr-only">Click link to expand information about linked </text>Linked Sections: {question.sections && question.sections.length}</a>
                    </h2>
                  </div>
                  <div className="box-content panel-collapse panel-details collapse panel-body" id="collapse-linked-sections">
                    <SectionList sections={question.sections} currentUser={this.props.currentUser} />
                  </div>
                </div>
              }
              {question.status === 'published' &&
                <ProgramsAndSystems item={question} />
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

  historyBar(question) {
    return (
      <div className="col-md-3 nopadding no-print">
        <h2 className="showpage_sidenav_subtitle">
          <text className="sr-only">Version History Navigation Links</text>
          <ul className="list-inline">
            <li className="subtitle_icon"><span className="fa fa-history" aria-hidden="true"></span></li>
            <li className="subtitle">History</li>
          </ul>
        </h2>
        <VersionInfo versionable={question} versionableType='Question' currentUser={this.props.currentUser} />
      </div>
    );
  }
}

QuestionShow.propTypes = {
  question:  questionProps,
  currentUser:   currentUserProps,
  router: PropTypes.object,
  handlePublish:  PropTypes.func,
  deleteQuestion: PropTypes.func,
  addQuestionToGroup: PropTypes.func,
  removeQuestionFromGroup: PropTypes.func,
  updateQuestionTags: PropTypes.func,
  setStats: PropTypes.func,
  stats: PropTypes.object,
  publishers: publishersProps
};
