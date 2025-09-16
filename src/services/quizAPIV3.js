import nhost from './nhost';

// 🧠 Lấy danh sách subject duy nhất
export const fetchSubjects = async () => {
  console.log('[fetchSubjects] Start');
  const query = `
    query {
      quizzes(distinct_on: subject) {
        subject
      }
    }
  `;
  try {
    const res = await nhost.graphql.request(query);
    console.log('[fetchSubjects] Response:', res);
    return res.data?.quizzes.map(q => q.subject).filter(Boolean) || [];
  } catch (error) {
    console.error('[fetchSubjects] Error:', error);
    return [];
  }
};

// 🧠 Lấy danh sách topic theo subject
export const fetchTopicsBySubject = async (subject) => {
  console.log('[fetchTopicsBySubject] Subject:', subject);
  const query = `
    query ($subject: String!) {
      quizzes(where: {subject: {_eq: $subject}}, distinct_on: topic) {
        topic
      }
    }
  `;
  try {
    const res = await nhost.graphql.request(query, { subject });
    console.log('[fetchTopicsBySubject] Response:', res);
    return res.data?.quizzes.map(q => q.topic).filter(Boolean) || [];
  } catch (error) {
    console.error('[fetchTopicsBySubject] Error:', error);
    return [];
  }
};

// 🧠 Lấy danh sách quiz theo subject và topic
export const fetchQuizzesBySubjectAndTopic = async (subject, topic) => {
  console.log('[fetchQuizzesBySubjectAndTopic] Subject:', subject, 'Topic:', topic);
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
    console.log('[fetchQuizzesBySubjectAndTopic] Response:', res);
    return res.data?.quizzes || [];
  } catch (error) {
    console.error('[fetchQuizzesBySubjectAndTopic] Error:', error);
    return [];
  }
};

// 📝 Gửi câu trả lời
export const submitAnswer = async ({ quiz_id, submission_id, selected_index = null, short_answer = null }) => {
  console.log('[submitAnswer] 🚀 Gửi answer:', {
    quiz_id, submission_id, selected_index, short_answer,
  });

  const mutation = `
    mutation SubmitAnswer($quiz_id: uuid!, $submission_id: uuid!, $selected_index: Int, $short_answer: String) {
      insert_quiz_answers_one(object: {
        quiz_id: $quiz_id,
        submission_id: $submission_id,
        selected_index: $selected_index,
        short_answer: $short_answer
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
    });

    const inserted = res.data?.insert_quiz_answers_one;
    if (!inserted) {
      console.error('[submitAnswer] ❌ Không chèn được answer:', res);
      throw new Error('Không thể gửi câu trả lời');
    }

    console.log('[submitAnswer] ✅ Trả lời thành công:', inserted);
    return inserted;
  } catch (error) {
    console.error('[submitAnswer] ❌ Lỗi gửi answer:', error);
    throw error;
  }
};
// Thêm vào trong file quizAPIV3.js

export const createSubmission = async ({ topic }) => {
  const mutation = `
    mutation($topic: String!) {
      insert_quizzes_submission_one(object: { topic: $topic }) {
        id
        created_at
      }
    }
  `;

  try {
    const res = await nhost.graphql.request(mutation, { topic }); // 🆕 Gửi biến topic
    const submission = res.data?.insert_quizzes_submission_one;
    if (!submission || !submission.id) throw new Error('Không thể tạo bản ghi submission');
    return submission.id;
  } catch (error) {
    console.error('[createSubmission] ❌ Lỗi khi tạo submission:', error);
    throw error;
  }
};

export const submitFullQuiz = async ({ quizzes, answers, studentName,topic }) => {
  console.log('[submitFullQuiz] 📥 Input:', { quizzes, answers, studentName });

  try {
    // 1. Tạo bản ghi submission
   const submission_id = await createSubmission({ topic }); // 🆕 Truyền topic vào

    console.log('[submitFullQuiz] 🆔 Submission ID:', submission_id);

    // 2. Gửi từng câu trả lời
    for (const quiz of quizzes) {
      const questionType = quiz.question_type || 'multiple_choice';
      const answer = answers[quiz.id];

      const input = {
        quiz_id: quiz.id,
        submission_id,
        selected_index: null,
        short_answer: null,
      };

      if (questionType === 'multiple_choice') {
        input.selected_index = typeof answer === 'number' ? answer : -1;
      } else if (questionType === 'short_answer') {
        input.short_answer = typeof answer === 'string' ? answer : '';
      }

      console.log('[submitFullQuiz] 📝 Gửi câu hỏi:', {
        quiz_id: input.quiz_id,
        selected_index: input.selected_index,
        short_answer: input.short_answer,
      });

      const res = await submitAnswer(input);

      console.log('[submitFullQuiz] ✅ Gửi xong quiz:', quiz.id, 'Result:', res);
    }

    console.log('[submitFullQuiz] ✅ Nộp bài hoàn tất');
    return true;
  } catch (error) {
    console.error('[submitFullQuiz] ❌ Lỗi khi gửi bài:', error);
    throw error;
  }
};
