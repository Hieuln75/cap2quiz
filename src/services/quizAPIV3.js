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

// Gửi câu trả lời
export const submitAnswer = async ({ quiz_id, submission_id, selected_index = null, short_answer = null }) => {
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
      throw new Error('Không thể gửi câu trả lời');
    }

    return inserted;
  } catch (error) {
    console.error('[submitAnswer] ❌ Lỗi gửi answer:', error);
    throw error;
  }
};

// Tạo submission mới
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
    const res = await nhost.graphql.request(mutation, { topic });
    const submission = res.data?.insert_quizzes_submission_one;
    if (!submission || !submission.id) throw new Error('Không thể tạo bản ghi submission');
    return submission.id;
  } catch (error) {
    console.error('[createSubmission] ❌ Lỗi khi tạo submission:', error);
    throw error;
  }
};

// Trừ credit_remaining
export const decreaseUserCredit = async (user_id) => {
  console.log('[decreaseUserCredit] Bắt đầu trừ credit cho user:', user_id);

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
      throw new Error('❌ Bạn không còn credit để nộp bài');
    }

    console.log('[decreaseUserCredit] ✅ Trừ credit thành công');
    return true;
  } catch (error) {
    console.error('[decreaseUserCredit] ❌ Lỗi khi trừ credit:', error);
    throw error;
  }
};

export const submitFullQuiz = async ({ quizzes, answers, studentName, topic }) => {
  console.log('[submitFullQuiz] 🟡 Bắt đầu submit bài', { quizzes, answers, studentName, topic });


  try {
    const user = await nhost.auth.getUser(); // 🛠️ Sửa: thêm await
    const user_id = user?.id;

    if (!user_id) {
      console.warn('[submitFullQuiz] ⚠️ Guest user – không trừ credit');
      alert('⚠️ Bạn đang nộp bài với tư cách khách (guest). Không bị trừ credit.');
    }


    const submission_id = await createSubmission({ topic });

  
    for (const [i, quiz] of quizzes.entries()) {
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


      await submitAnswer(input);
    }

    // ✅ Chỉ trừ credit nếu có user_id
    if (user_id) {

      await decreaseUserCredit(user_id);
      alert('✅ Đã trừ 1 lần thi !');
    }

    return true;
  } catch (error) {
    console.error('[submitFullQuiz] ❌ Lỗi khi nộp bài:', error);
    alert('❌ Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.\nChi tiết: ' + error.message);
    throw error;
  }
};

// Nộp toàn bộ bài làm
{/*
export const submitFullQuiz = async ({ quizzes, answers, studentName, topic }) => {
  console.log('[submitFullQuiz] 🟡 Bắt đầu submit bài', { quizzes, answers, studentName, topic });
  alert('🔄 Đang bắt đầu nộp bài...');

  try {
    const user = nhost.auth.getUser();
    const user_id = user?.id;

    if (!user_id) {
      alert('❌ Không tìm thấy thông tin người dùng. Vui lòng đăng nhập để được làm toàn bộ.');
      //throw new Error('Không có user_id từ nhost.auth');
      return true;
    }

    alert(`📌 Tạo bản ghi nộp bài cho topic "${topic}"...`);
    const submission_id = await createSubmission({ topic });
    console.log('[submitFullQuiz] ✅ Submission ID:', submission_id);
    alert(`✅ Tạo submission thành công (ID: ${submission_id})`);

    alert(`📝 Đang gửi ${quizzes.length} câu trả lời...`);
    for (const [i, quiz] of quizzes.entries()) {
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

      console.log(`[submitFullQuiz] ➡️ Gửi câu hỏi ${i + 1}/${quizzes.length}`, input);
      alert(`➡️ Đang gửi câu ${i + 1}: ${quiz.question.slice(0, 50)}...`);
      await submitAnswer(input);
    }

    alert('💳 Đang trừ 1 credit...');
    await decreaseUserCredit(user_id);
    alert('✅ Đã trừ 1 credit thành công!');

    console.log('[submitFullQuiz] ✅ Nộp bài thành công');
    alert('🎉 Nộp bài thành công!');
    return true;
  } catch (error) {
    console.error('[submitFullQuiz] ❌ Lỗi khi nộp bài:', error);
    alert('❌ Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.\nChi tiết: ' + error.message);
    throw error;
  }
};
*/}
{/*import nhost from './nhost';

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
*/}