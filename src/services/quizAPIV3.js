// ĐÃ SỬA FILE: quizAPIV3.js

import nhost from './nhost';
// 🧠 Lấy danh sách subject duy nhất
export const fetchSubjects = async () => {
  const query = `
    query {
      quizzes(distinct_on: subject) {
        subject
      }
    }
  `;
  try {
    const res = await nhost.graphql.request(query);
    return res.data?.quizzes.map(q => q.subject).filter(Boolean) || [];
  } catch (error) {
    console.error('[fetchSubjects] Error:', error);
    return [];
  }
};

// 🧠 Lấy danh sách topic theo subject
export const fetchTopicsBySubject = async (subject) => {
  const query = `
    query ($subject: String!) {
      quizzes(where: {subject: {_eq: $subject}}, distinct_on: topic) {
        topic
      }
    }
  `;
  try {
    const res = await nhost.graphql.request(query, { subject });
    return res.data?.quizzes.map(q => q.topic).filter(Boolean) || [];
  } catch (error) {
    console.error('[fetchTopicsBySubject] Error:', error);
    return [];
  }
};


// 🧠 Lấy danh sách quiz theo subject và topic
export const fetchQuizzesBySubjectAndTopic = async (subject, topic) => {
  const query = `
    query ($subject: String!, $topic: String!) {
      quizzes(where: {subject: {_eq: $subject}, topic: {_eq: $topic}}, order_by: {created_at: asc}) {
        id
        question
        question_image
        options
        correct_index
        question_type
        correct_answer_text
        hint
        audio_url
      }
    }
  `;
  try {
    const res = await nhost.graphql.request(query, { subject, topic });
    return res.data?.quizzes || [];
  } catch (error) {
    console.error('[fetchQuizzesBySubjectAndTopic] Error:', error);
    return [];
  }
};

export const createSubmission = async ({ topic, user_id }) => {
  console.log('[createSubmission] gọi mutation với topic, user_id =', { topic, user_id });

  const mutation = `
    mutation($topic: String!, $user_id: uuid) {
      insert_quizzes_submission_one(object: {
        topic: $topic,
        user_id: $user_id
      }) {
        id
      }
    }
  `;

  try {
    const res = await nhost.graphql.request(mutation, { topic, user_id });
   console.log('[createSubmission] GraphQL response =', res);
    const submission = res.data?.insert_quizzes_submission_one;
    if (!submission?.id) throw new Error('Không thể tạo submission');
    return submission.id;
  } catch (error) {
    console.error('[createSubmission] ❌', error);
    throw error;
  }
};


const submitAnswer = async ({
  quiz_id,
  submission_id,
  selected_index = null,
  short_answer = null,
  user_id = null,
}) => {
  const mutation = `
    mutation SubmitAnswer(
      $quiz_id: uuid!,
      $submission_id: uuid!,
      $selected_index: Int,
      $short_answer: String,
      $user_id: uuid
    ) {
      insert_quiz_answers_one(object: {
        quiz_id: $quiz_id,
        submission_id: $submission_id,
        selected_index: $selected_index,
        short_answer: $short_answer,
        user_id: $user_id
      }) {
        id
      }
    }
  `;

  try {
    const res = await nhost.graphql.request(mutation, {
      quiz_id,
      submission_id,
      selected_index,
      short_answer,
      user_id,
    });

    const inserted = res.data?.insert_quiz_answers_one;
    if (!inserted) {
      throw new Error('Không thể gửi câu trả lời');
    }

    return inserted;
  } catch (error) {
      throw error;
  }
};


{/*export const submitAnswer = async ({
  quiz_id,
  submission_id,
  selected_index = null,
  short_answer = null,
  user_id = null,
}) => {
  const mutation = `
    mutation SubmitAnswer(
      $quiz_id: uuid!,
      $submission_id: uuid!,
      $selected_index: Int,
      $short_answer: String,
      $user_id: uuid
    ) {
      insert_quiz_answers_one(object: {
        quiz_id: $quiz_id,
        submission_id: $submission_id,
        selected_index: $selected_index,
        short_answer: $short_answer,
        user_id: $user_id,
        student_id: $user_id
      }) {
        id
      }
    }
  `;

  try {
    const res = await nhost.graphql.request(mutation, {
      quiz_id,
      submission_id,
      selected_index,
      short_answer,
      user_id,
    });

    const inserted = res.data?.insert_quiz_answers_one;
    if (!inserted) {
      throw new Error('Không thể gửi câu trả lời');
    }

    return inserted;
  } catch (error) {
    console.error('[submitAnswer] ❌', error);
    throw error;
  }
};
*/}

export const decreaseUserCredit = async (user_id) => {
  const mutation = `
    mutation DecreaseCredit($user_id: uuid!) {
      update_quiz_credits(
        where: { user_id: { _eq: $user_id }, credit_remaining: { _gt: 0 } },
        _inc: { credit_remaining: -1 }
      ) {
        affected_rows
      }
    }
  `;

  try {
    const res = await nhost.graphql.request(mutation, { user_id });
    const updated = res.data?.update_quiz_credits?.affected_rows || 0;

    if (updated === 0) {
      throw new Error('❌ Không còn credit');
    }

    return true;
  } catch (error) {
    console.error('[decreaseUserCredit] ❌', error);
    throw error;
  }
};

export const submitFullQuiz = async ({ quizzes, answers, topic, user_id }) => {
  try {
    const submission_id = await createSubmission({ topic, user_id });

    for (const quiz of quizzes) {
      const answer = answers[quiz.id];
      const input = {
        quiz_id: quiz.id,
        submission_id,
        selected_index: null,
        short_answer: null,
        user_id,
      };

      if (quiz.question_type === 'multiple_choice') {
        input.selected_index = typeof answer === 'number' ? answer : -1;
      } else if (quiz.question_type === 'short_answer') {
        input.short_answer = typeof answer === 'string' ? answer : '';
      }

      await submitAnswer(input);
    }

    if (user_id) {
      await decreaseUserCredit(user_id);
    }

    return true;
  } catch (error) {
    console.error('[submitFullQuiz] ❌', error);
    alert('❌ Có lỗi xảy ra khi nộp bài: ' + error.message);
    throw error;
  }
};

