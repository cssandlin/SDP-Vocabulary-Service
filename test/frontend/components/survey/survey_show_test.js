import { expect, renderComponent } from '../../test_helper';
import SurveyShow from '../../../../webpack/components/surveys/SurveyShow';

describe('SurveyShow', () => {
  let component;

  beforeEach(() => {
    const props = {
      currentUser:{},
      publishSurvey: ()=> {},
      router: {},
      survey: {
        name: "Robot Questionaire",
        surveySections: [1,2,3]
      },
      sections: [
        {id:1,name:"Bleep",createdBy:{email:"test_author@gmail.com"},createdAt:"2016-12-27T23:40:54.505Z",updatedAt:"2016-12-28T23:40:54.505Z",versionIndependentId:"SECT-1",version:1,controlNumber:"","questions":[]},
        {id:2,name:"Bloop",createdBy:{email:"test_author@gmail.com"},createdAt:"2016-12-28T23:40:54.505Z",updatedAt:"2016-12-29T23:40:54.505Z",versionIndependentId:"SECT-1",version:1,controlNumber:"","questions":[]},
        {id:3,name:"I am a robot",createdBy:{email:"test_author@gmail.com"},createdAt:"2016-12-29T23:40:54.505Z",updatedAt:"2016-12-30T23:40:54.505Z",versionIndependentId:"SECT-1",version:1,controlNumber:"","questions":[]}
      ],
      deleteSurvey: ()=> {}
    };
    const startState = {};
    component = renderComponent(SurveyShow, props, startState);
  });

  it('should create a list of sections', () => {
    // Drop out of JQuery and just use draw javascript selectors
    expect(component[0].querySelectorAll('.survey-section .panel-heading').length).to.equal(3);
  });

  it('should render an empty list of sections', () => {
    let emptyComponent = renderComponent(SurveyShow, {name: 'test'}, {});
    expect(emptyComponent[0].querySelectorAll('.survey-section').length).to.equal(0);
  });

});
