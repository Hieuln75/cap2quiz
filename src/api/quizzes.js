import nhost from '../services/nhost';

export async function getQuizzes() {
  const query = `
    query {
      quizzes {
        id
        question
        created_at
      }
    }
  `;

  const response = await nhost.graphql.request(query);

  if (response.error) throw new Error(response.error.message || 'Failed to fetch quizzes');

  return response.data.quizzes;
}

export async function addQuiz(question) {
  const mutation = `
    mutation ($question: String!) {
      insert_quizzes_one(object: { question: $question }) {
        id
        question
        created_at
      }
    }
  `;

  const variables = { question };

  const response = await nhost.graphql.request(mutation, variables);

  if (response.error) throw new Error(response.error.message || 'Failed to add quiz');

  return response.data.insert_quizzes_one;
}
