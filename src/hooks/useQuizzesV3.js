import { useState, useEffect } from 'react';
import quizAPIv3 from './quizAPIv3';

export default function useQuizzesV3(subject, topic) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!subject || !topic) return;

    setLoading(true);
    setError(null);

    quizAPIv3.fetchQuizzesBySubjectAndTopic(subject, topic)
      .then(data => {
        setQuizzes(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch quizzes');
        setLoading(false);
      });
  }, [subject, topic]);

  return { quizzes, loading, error };
}
