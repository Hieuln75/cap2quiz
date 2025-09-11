import nhost from '../services/nhost';

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
      }
    }
  `;
  const res = await nhost.graphql.request(query, { subject, topic });
  return res.data?.v2_quizzes || [];
};

// Gửi câu trả lời vào bảng v2_quiz_answers
export const submitAnswer = async ({ quiz_id, student_id, selected_index }) => {
  const mutation = `
    mutation InsertAnswer($quiz_id: uuid!, $student_id: String, $selected_index: Int!) {
      insert_v2_quiz_answers_one(object: {
        quiz_id: $quiz_id,
        student_id: $student_id,
        selected_index: $selected_index
      }) {
        id
      }
    }
  `;
  return nhost.graphql.request(mutation, { quiz_id, student_id, selected_index });
};
