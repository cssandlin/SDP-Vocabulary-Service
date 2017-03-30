require 'test_helper'

class QuestionsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
  include ActiveJob::TestHelper

  DRAFT = 'draft'.freeze
  PUBLISHED = 'published'.freeze

  setup do
    @question  = questions(:one)
    @question5 = questions(:five)
    @current_user = users(:admin)
    sign_in @current_user
  end

  test 'should get index' do
    get questions_url, xhr: true, params: nil
    assert_response :success
  end

  test 'should get my questions' do
    get my_questions_url, xhr: true, params: nil
    assert_response :success
    JSON.parse(response.body).each do |f|
      assert f['created_by']['id'] == @current_user.id
    end
  end

  test 'revisions should increment version without needing a param' do
    post questions_url(format: :json), params: { question: { content: 'This is now a thread.', question_type_id: @question.question_type.id } }
    Question.last.publish
    v1 = Question.last
    post questions_url(format: :json), params: { question: { version_independent_id: Question.last.version_independent_id, content: 'This is now a revision thread.', question_type_id: @question.question_type.id } }
    assert_response :success
    v2 = Question.last
    assert_equal v1.version_independent_id, v2.version_independent_id
    assert_equal v1.version + 1, v2.version
    assert_equal 'This is now a revision thread.', v2.content
  end

  test 'cannot revise something you do not own' do
    post questions_url(format: :json), params: { question: { content: 'This is now a thread.', question_type_id: @question.question_type.id } }
    Question.last.publish
    sign_in users(:not_admin)
    post questions_url(format: :json), params: { question: { version_independent_id: Question.last.version_independent_id, content: 'This is now a revision thread.', question_type_id: @question.question_type.id } }
    assert_response :unauthorized
  end

  test 'cannot revise a draft' do
    post questions_url(format: :json), params: { question: { content: 'This is now a thread.', question_type_id: @question.question_type.id } }
    # Question.last.publish
    assert_equal DRAFT, Question.last.status
    post questions_url(format: :json), params: { question: { version_independent_id: Question.last.version_independent_id, content: 'This is now a revision thread.', question_type_id: @question.question_type.id } }
    assert_response :unprocessable_entity
  end

  test 'should create a draft question' do
    assert_enqueued_jobs 0
    assert_difference('Question.count') do
      post questions_url(format: :json), params: { question: { content: 'Unique content', question_type_id: @question.question_type.id } }
    end
    assert_enqueued_jobs 1
    assert_response :created
    assert_equal DRAFT, Question.last.status
    assert_equal 'Unique content', Question.last.content
  end

  test 'should update a draft question' do
    post questions_url(format: :json), params: { question: { content: 'TBD content', question_type_id: @question.question_type.id } }
    assert_equal DRAFT, Question.last.status
    put question_url(Question.last, format: :json), params: { question: { content: 'new content' } }
    assert_equal 'new content', Question.last.content
  end

  test 'should be unable to update a draft question owned by someone else' do
    patch question_url(@question5, format: :json), params: { question: { content: 'new content' } }
    assert_response :unauthorized
  end

  test 'should be unable to update a published question' do
    post questions_url(format: :json), params: { question: { content: 'TBD content', question_type_id: @question.question_type.id } }
    assert_equal DRAFT, Question.last.status
    put publish_question_path(Question.last, format: :json)
    assert_equal PUBLISHED, Question.last.status
    patch question_url(Question.last, format: :json), params: { question: { content: 'secret content' } }
    assert_response :unprocessable_entity
    assert_nil Question.find_by(content: 'secret content')
  end

  test 'should publish a draft question' do
    post questions_url(format: :json), params: { question: { content: 'TBD content', question_type_id: @question.question_type.id } }
    assert_equal DRAFT, Question.last.status
    put publish_question_path(Question.last, format: :json)
    assert_equal PUBLISHED, Question.last.status
  end

  test 'should fail to destroy a published question' do
    post questions_url(format: :json), params: { question: { content: 'TBD content', question_type_id: @question.question_type.id } }
    assert_equal DRAFT, Question.last.status
    put publish_question_path(Question.last, format: :json)
    assert_equal PUBLISHED, Question.last.status
    assert_response :success
    delete question_url(Question.last)
    assert_response 422
    # TODO: deprecation
  end

  test 'should destroy a draft question' do
    post questions_url(format: :json), params: { question: { content: 'TBD content', question_type_id: @question.question_type.id } }
    assert_equal Question.last.status, 'draft'
    last_id = Question.last.id
    assert_difference('Question.count', -1) do
      delete question_url(Question.last, format: :json)
    end
    assert_response :success
    assert_not_equal last_id, Question.last
  end

  test 'should destroy a draft question and questionForms' do
    post questions_url(format: :json), params: { question: { content: 'TBD content', question_type_id: @question.question_type.id } }
    assert_equal Question.last.status, 'draft'
    last_id = Question.last.id
    post forms_url(format: :json), params: { form: { name: 'Create test form', created_by_id: @question.created_by_id, linked_questions: [last_id], linked_response_sets: [nil] } }
    assert_difference('Question.count', -1) do
      assert_difference('FormQuestion.count', -1) do
        assert_difference('Form.count', 0) do
          delete question_url(Question.last, format: :json)
        end
      end
    end
    assert_response :success
    assert_not_equal last_id, Question.last
  end
end
