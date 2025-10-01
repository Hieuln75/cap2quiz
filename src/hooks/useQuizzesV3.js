
import { useState, useEffect } from 'react';
import * as api from '../services/quizAPIV3';

export default function useQuizzesV3() {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  useEffect(() => {
    api.fetchSubjects().then(setSubjects).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedSubject) {
      setTopics([]);
      setSelectedTopic('');
      setQuizzes([]);
      return;
    }
    api.fetchTopicsBySubject(selectedSubject).then(setTopics).catch(console.error);
    setSelectedTopic('');
    setQuizzes([]);
  }, [selectedSubject]);

  useEffect(() => {
    if (!selectedSubject || !selectedTopic) {
      setQuizzes([]);
      return;
    }
    api.fetchQuizzesBySubjectAndTopic(selectedSubject, selectedTopic).then(setQuizzes).catch(console.error);
  }, [selectedSubject, selectedTopic]);

  return {
    subjects,
    topics,
    quizzes,
    selectedSubject,
    setSelectedSubject,
    selectedTopic,
    setSelectedTopic,
  };
}

