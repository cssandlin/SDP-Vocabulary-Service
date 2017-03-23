import React, { Component, PropTypes } from 'react';
import { formProps } from "../prop-types/form_props";
import { removeForm, reorderForm} from '../actions/form_actions';

class SurveyFormList extends Component {
  render() {
    if(!this.props.forms || this.props.forms.length < 1){
      return (<div className="form-group">No Forms Selected</div>);
    }
    var survey = this.props.survey;
    // Hideous placeholder
    return (
      <div className="form-group">
        {this.props.forms.map((f, i) => {
          return (<div key={`added_form_${f.id}`}>
            {f.name}
            {f.questions.map((q, j) => {
              return (
              <div key={`added_form_q_${j}`}>
                {q.content}

              </div> );
            })}
            <div className="form-group">
            <div className="col-md-3">
              <div className="btn btn-small btn-default move-up"
                   onClick={() => reorderForm(survey, i, 1)}>
                <i title="Move Up" className="fa fa fa-arrow-up"></i>
              </div>
              <div className="btn btn-small btn-default move-down"
                   onClick={() => reorderForm(survey, i, -1)}>
                <i className="fa fa fa-arrow-down" title="Move Down"></i>
              </div>
              <div className="btn btn-small btn-default"
                   onClick={() => removeForm(survey, i)}>
                <i className="fa fa fa-trash" title="Remove"></i>
              </div>
            </div>
          </div>
            </div> );
        })}
      </div>
    );
  }
}

SurveyFormList.propTypes = {
  survey: PropTypes.object,
  forms: PropTypes.arrayOf(formProps)
};

export default SurveyFormList;
