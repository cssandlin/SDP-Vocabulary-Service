import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setSteps } from '../actions/tutorial_actions';
import { fetchForm, saveForm, newForm, saveDraftForm } from '../actions/form_actions';
import { addQuestion, removeQuestion, reorderQuestion, fetchQuestion, fetchQuestions } from '../actions/questions_actions';
import FormEdit from '../components/FormEdit';
import ResponseSetModal from '../components/ResponseSetModal';
import { fetchResponseSets }   from '../actions/response_set_actions';
import QuestionModalContainer  from './QuestionModalContainer';
import QuestionSearchContainer from './QuestionSearchContainer';
import { formProps } from '../prop-types/form_props';
import { questionsProps } from '../prop-types/question_props';
import { responseSetsProps } from '../prop-types/response_set_props';
import {Button} from 'react-bootstrap';
import _ from 'lodash';

class FormsEditContainer extends Component {

  constructor(props) {
    super(props);
    let selectedFormSaver = this.props.saveForm;
    if (this.props.params.formId) {
      this.props.fetchForm(this.props.params.formId);
      if (this.props.params.action === 'edit') {
        selectedFormSaver = this.props.saveDraftForm;
      }
    } else {
      this.props.newForm();
      this.props.params.formId = 0;
      this.props.params.action = 'new';
    }
    this.state = {selectedFormSaver: selectedFormSaver, showQuestionModal: false, showResponseSetModal: false};
    this.closeQuestionModal = this.closeQuestionModal.bind(this);
    this.handleSaveQuestionSuccess = this.handleSaveQuestionSuccess.bind(this);
  }

  componentWillMount() {
    this.props.fetchQuestions();
    this.props.fetchResponseSets();
  }

  componentDidMount() {
    this.props.setSteps([
      {
        title: 'Help',
        text: 'Click next to see a step by step walkthrough for using this page.',
        selector: '.help-link',
        position: 'bottom',
      },
      {
        title: 'Author Question For Form',
        text: 'If you need to create a new question without leaving the the form use this button to author a new question from scratch.',
        selector: '.add-question',
        position: 'right',
      },
      {
        title: 'Question Search',
        text: 'Type in your search keywords here to search for questions to add to the form.',
        selector: '.search-group',
        position: 'right',
      },
      {
        title: 'Advanced Search Filters',
        text: 'Click Advanced to see additional filters you can apply to your search.',
        selector: '.adv-search-link',
        position: 'right',
      },
      {
        title: 'Question Result',
        text: 'Use these search results to find the question you want to add.',
        selector: '.u-result',
        position: 'right',
      },
      {
        title: 'Add Question',
        text: 'Click on the add button to select a question for the form.',
        selector: '.fa-plus-square',
        position: 'right',
      },
      {
        title: 'Form Details',
        text: 'Edit the various form details on the right side of the page. Select save in the top right of the page when done editing to save a draft of the content.',
        selector: '.form-edit-details',
        position: 'left',
      }]);
  }

  componentDidUpdate(prevProps) {
    if(prevProps.params.formId != this.props.params.formId){
      this.props.fetchForm(this.props.params.formId);
    }
    if(this.props.form && this.props.form.formQuestions) {
      this.refs.form.setState(Object.assign(this.refs.form.state, {formQuestions: this.props.form.formQuestions}));
    }
  }

  closeQuestionModal(){
    this.setState({showQuestionModal: false});
  }

  handleSaveQuestionSuccess(successResponse){
    this.setState({showQuestionModal: false});
    this.props.fetchQuestion(successResponse.data.id);
    this.props.addQuestion(this.props.form, successResponse.data);
  }

  render() {
    if(!this.props.form || !this.props.questions){
      return (
        <div>Loading...</div>
      );
    }
    return (
      <div className="form-edit-container">
        <QuestionModalContainer route ={this.props.route}
                                router={this.props.router}
                                showModal={this.state.showQuestionModal}
                                closeQuestionModal ={()=>this.setState({showQuestionModal: false})}
                                handleSaveQuestionSuccess={this.handleSaveQuestionSuccess} />
        <ResponseSetModal show={this.state.showResponseSetModal}
                          router={this.props.router}
                          closeModal={() => this.setState({showResponseSetModal: false})}
                          saveResponseSetSuccess={() => this.setState({showResponseSetModal: false})} />
        <div className="row">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h2 className="panel-title">{_.capitalize(this.props.params.action)} Form </h2>
            </div>
            <div className="panel-body">
              <div className="col-md-5">
                <div className="row add-question">
                  <Button tabIndex="4" onClick={()=>this.setState({showQuestionModal: true})} bsStyle="primary">Add New Question</Button>
                </div>
                <QuestionSearchContainer form={this.props.form} />
              </div>
              <FormEdit ref ='form'
                        form={this.props.form}
                        route ={this.props.route}
                        router={this.props.router}
                        action={this.props.params.action || 'new'}
                        questions={this.props.questions}
                        responseSets ={this.props.responseSets}
                        formSubmitter={this.state.selectedFormSaver}
                        removeQuestion ={this.props.removeQuestion}
                        reorderQuestion={this.props.reorderQuestion}
                        showResponseSetModal={() => this.setState({showResponseSetModal: true})} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({setSteps, fetchResponseSets, addQuestion, fetchQuestions, fetchQuestion,
    newForm, fetchForm, removeQuestion, reorderQuestion,
    saveForm, saveDraftForm}, dispatch);
}

function mapStateToProps(state, ownProps) {
  return {
    form: state.forms[ownProps.params.formId||0],
    questions: state.questions,
    responseSets: state.responseSets
  };
}

FormsEditContainer.propTypes = {
  form:  formProps,
  route: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  questions: questionsProps,
  responseSets: responseSetsProps,
  setSteps: PropTypes.func,
  newForm:  PropTypes.func,
  saveForm: PropTypes.func,
  fetchForm: PropTypes.func,
  addQuestion: PropTypes.func,
  saveDraftForm: PropTypes.func,
  fetchQuestion: PropTypes.func,
  fetchQuestions: PropTypes.func,
  removeQuestion: PropTypes.func,
  reorderQuestion: PropTypes.func,
  fetchResponseSets: PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(FormsEditContainer);
