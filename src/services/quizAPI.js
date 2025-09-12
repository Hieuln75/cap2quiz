import nhost from './nhost';

// Lấy danh sách subject duy nhất từ bảng v2_quizzes
export const fetchSubjects = async () => {
  const query = `
    query {
      v2_quizzes(distinct_on: subject) {
        subject
      }
    }
  `;
  const res = await nhost.graphql.request(query);
  return res.data?.v2_quizzes.map(q => q.subject).filter(Boolean) || [];
};

// Lấy danh sách topic theo subject từ bảng v2_quizzes
export const fetchTopicsBySubject = async (subject) => {
  const query = `
    query ($subject: String!) {
      v2_quizzes(where: {subject: {_eq: $subject}}, distinct_on: topic) {
        topic
      }
    }
  `;
  const res = await nhost.graphql.request(query, { subject });
  return res.data?.v2_quizzes.map(q => q.topic).filter(Boolean) || [];
};

// Lấy danh sách quiz theo subject và topic từ bảng v2_quizzes
export const fetchQuizzesBySubjectAndTopic = async (subject, topic) => {
  const query = `
    query ($subject: String!, $topic: String!) {
      v2_quizzes(where: {subject: {_eq: $subject}, topic: {_eq: $topic}}, order_by: {created_at: asc}) {
        id
        question
        question_image
        options
        correct_index
        question_type
        correct_answer_text
      }
    }
  `;
  const res = await nhost.graphql.request(query, { subject, topic });

  console.log('fetchQuizzesBySubjectAndTopic full response:', res);

  if (res.error) {
    console.error('GraphQL error details:', JSON.stringify(res.error, null, 2));
    return [];
  }

  return res.data?.v2_quizzes || [];
};


// Gửi câu trả lời vào bảng v2_quiz_answers
export const submitAnswer = async ({ quiz_id, student_id, selected_index = null, short_answer = null }) => {
  const mutation = `
    mutation InsertAnswer($quiz_id: uuid!, $student_id: String, $selected_index: Int, $short_answer: String) {
      insert_v2_quiz_answers_one(object: {
        quiz_id: $quiz_id,
        student_id: $student_id,
        selected_index: $selected_index,
        short_answer: $short_answer
      }) {
        id
      }
    }
  `;
  return nhost.graphql.request(mutation, { quiz_id, student_id, selected_index, short_answer });
};
