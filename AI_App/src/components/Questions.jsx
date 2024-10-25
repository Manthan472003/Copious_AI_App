import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { getAllQuestions } from '../Services/QuestionServices';
import questionsData from './relatedQuestions.json';

const Questions = () => {
  const [initialQuestionAnswered, setInitialQuestionAnswered] = useState(false);
  const [secondQuestionAnswered, setSecondQuestionAnswered] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSubQuestionIndex, setCurrentSubQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  // const [questionsData, setQuestionsData] = useState([]);

  // Hard-coded questions
  const initialQuestion = "आपण काय कारणासाठी भेटत आहात?";
  const initialOptions = [
    "नवीन जन्मलेले बाळ",
    "चांगले मूल",
    "लसीकरण",
    "पाठपुरावा",
    "नियोजित भेट",
  ];

  const secondQuestion = "आपण कोणत्या कारणामुळे ग्रस्त आहात?";
  const secondOptions = [
    "ताप",
    "खोकला",
    "सर्दी",
    "खोकला आणि सर्दी",
    "छाती दुखणे",
    "संडास लागणे",
  ];

  // // Fetch sections from backend wrapped in useCallback
  // const fetchQuestions = useCallback(async () => {
  //   const response = await getAllQuestions();
  //   setQuestionsData(response.data); // Assuming response.data is the array of sections
  // }, []);

  // useEffect(() => {
  //   fetchQuestions();
  // }, [fetchQuestions]);

  const handleInitialOptionSelect = (option) => {
    setResponses((prev) => [...prev, { question: initialQuestion, answer: option }]);
    setInitialQuestionAnswered(true);
  };

  const handleSecondOptionSelect = (option) => {
    setResponses((prev) => [...prev, { question: secondQuestion, answer: option }]);
    setSecondQuestionAnswered(true);

    // Filter questions based on the selected second question option
    const relatedQuestions = questionsData.filter(question => question.main_question === option);
    setFilteredQuestions(relatedQuestions);
    setCurrentQuestionIndex(0); // Reset to first question
    setCurrentSubQuestionIndex(0); // Reset to first sub-question
  };

  // Render initial question
  if (!initialQuestionAnswered) {
    return (
      <View style={styles.container}>
        <Text style={styles.questionText}>{initialQuestion}</Text>
        {initialOptions.map((option, index) => (
          <Button
            key={index}
            title={option}
            onPress={() => handleInitialOptionSelect(option)}
            color="#3F51B5"
          />
        ))}
      </View>
    );
  }

  // Render second question
  if (!secondQuestionAnswered) {
    return (
      <View style={styles.container}>
        <Text style={styles.questionText}>{secondQuestion}</Text>
        {secondOptions.map((option, index) => (
          <Button
            key={index}
            title={option}
            onPress={() => handleSecondOptionSelect(option)}
            color="#3F51B5"
          />
        ))}
      </View>
    );
  }

  // Render sub-questions
  const currentQuestion = filteredQuestions[currentQuestionIndex];
  if (!currentQuestion || !currentQuestion.sub_questions) {
    return (
      <View style={styles.container}>
        <Text style={styles.questionText}>No more questions available.</Text>
      </View>
    );
  }

  const currentSubQuestion = currentQuestion.sub_questions[currentSubQuestionIndex];

  const handleOptionSelect = (option) => {
    const newResponses = [...responses, { question: currentSubQuestion.sub_question, answer: option }];
    setResponses(newResponses);

    const selectedOption = currentSubQuestion.options.find(opt => typeof opt === 'object' && opt.option === option);

    if (selectedOption && selectedOption.related_questions) {
      setRelatedQuestions(selectedOption.related_questions);
      setCurrentSubQuestionIndex(0); 
    } else {
      // Move to the next sub-question
      setCurrentSubQuestionIndex(prev => prev + 1);
    }
  };

  const renderCurrentSubQuestion = () => (
    <View>
      <Text style={styles.subQuestionText}>{currentSubQuestion.sub_question}</Text>
      {currentSubQuestion.options.map((option, index) => (
        <Button
          key={index}
          title={typeof option === 'string' ? option : option.option}
          onPress={() => handleOptionSelect(typeof option === 'string' ? option : option.option)}
          color="#3F51B5"
        />
      ))}
    </View>
  );

  const renderSubmitButton = () => (
    <Button title="Submit" onPress={handleSubmit} color="#3F51B5" />
  );

  const handleSubmit = () => {
    console.log('Responses submitted:', responses);
  };

  return (
    <View style={styles.container}>
      {currentSubQuestionIndex < currentQuestion.sub_questions.length ? (
        <>
          <Text style={styles.questionText}>{currentQuestion.main_question}</Text>
          {renderCurrentSubQuestion()}
        </>
      ) : (
        <View style={styles.container}>
          <Text style={styles.responseText}>Thank you for answering the questions!</Text>
          {renderSubmitButton()}
        </View>
      )}
      {responses.map((response, index) => (
        <Text key={index} style={styles.responseText}>{`${response.question}: ${response.answer}`}</Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  subQuestionText: {
    fontSize: 18,
    marginVertical: 10,
    color: 'black',
  },
  responseText: {
    fontSize: 16,
    marginTop: 5,
    color: 'black',
  },
});

export default Questions;