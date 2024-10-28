import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native'; // Import useRoute to access navigation params
import { getAllQuestions } from '../Services/QuestionServices';

const Questions = () => {
  const route = useRoute(); // Get the route object
  const { name: patientName, age: patientAge } = route.params; // Extract patient name and age

  const [initialQuestionAnswered, setInitialQuestionAnswered] = useState(false);
  const [secondQuestionAnswered, setSecondQuestionAnswered] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSubQuestionIndex, setCurrentSubQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [relatedQuestionIndex, setRelatedQuestionIndex] = useState(0);
  const [questionsData, setQuestionsData] = useState([]);

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

  const handleInitialOptionSelect = (option) => {
    setResponses((prev) => [...prev, { question: initialQuestion, answer: option }]);
    setInitialQuestionAnswered(true);
  };

  const handleSecondOptionSelect = (option) => {
    setResponses((prev) => [...prev, { question: secondQuestion, answer: option }]);
    setSecondQuestionAnswered(true);

    const relatedQuestions = questionsData.filter(question => question.main_question === option);
    setFilteredQuestions(relatedQuestions);
    setCurrentQuestionIndex(0);
  };

  // Fetch questions from backend wrapped in useCallback
  const fetchQuestions = useCallback(async () => {
    const response = await getAllQuestions();
    setQuestionsData(response.data);
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  if (!initialQuestionAnswered) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.questionText}>{initialQuestion}</Text>
        {initialOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.button}
            onPress={() => handleInitialOptionSelect(option)}
          >
            <Text style={styles.buttonText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  if (!secondQuestionAnswered) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.questionText}>{secondQuestion}</Text>
        {secondOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.button}
            onPress={() => handleSecondOptionSelect(option)}
          >
            <Text style={styles.buttonText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const allQuestionsAnswered = currentQuestionIndex >= filteredQuestions.length && relatedQuestionIndex >= relatedQuestions.length;

  if (allQuestionsAnswered) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>सारांश</Text>
          <View style={styles.patientInfoContainer}>
            <View style={styles.patientCard}>
              <Text style={styles.patientInfo}>पेशंटचे नाव: <Text style={styles.highlight}>{patientName}</Text></Text>
            </View>
            <View style={styles.patientCard}>
              <Text style={styles.patientInfo}>पेशंटचे वय: <Text style={styles.highlight}>{patientAge}</Text></Text>
            </View>
          </View>
          <View style={styles.answersContainer}>
            {responses.map((response, index) => (
              <View key={index} style={styles.answerCard}>
                {/* <Text style={styles.questionTextBold}>{response.question}</Text> */}
                <Text style={styles.answerText}>{response.answer}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  const currentSubQuestion = currentQuestion?.sub_questions[currentSubQuestionIndex];

  const handleOptionSelect = (option) => {
    const newResponses = [...responses, { question: currentSubQuestion.sub_question, answer: option }];
    setResponses(newResponses);

    const selectedOption = currentSubQuestion.options.find(opt => typeof opt === 'object' && opt.option === option);

    if (selectedOption && selectedOption.related_questions) {
      setRelatedQuestions(selectedOption.related_questions);
      setRelatedQuestionIndex(0);
      setCurrentSubQuestionIndex(0);
    } else {
      setCurrentSubQuestionIndex(prev => prev + 1);
    }

    if (currentSubQuestionIndex + 1 >= currentQuestion.sub_questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentSubQuestionIndex(0);
      setRelatedQuestions([]);
    }
  };

  const renderCurrentSubQuestion = () => (
    <View style={styles.questionCard}>
      <Text style={styles.subQuestionText}>{currentSubQuestion.sub_question}</Text>
      {currentSubQuestion.options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={() => handleOptionSelect(typeof option === 'string' ? option : option.option)}
        >
          <Text style={styles.buttonText}>{typeof option === 'string' ? option : option.option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderRelatedQuestions = () => {
    const relatedQuestion = relatedQuestions[relatedQuestionIndex];

    if (!relatedQuestion) return null;

    return (
      <View style={styles.questionCard}>
        <Text style={styles.subQuestionText}>{relatedQuestion.related_question}</Text>
        {relatedQuestion.related_options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.button}
            onPress={() => {
              const newResponses = [...responses, { question: relatedQuestion.related_question, answer: option }];
              setResponses(newResponses);
              setRelatedQuestionIndex(prev => prev + 1);
            }}
          >
            <Text style={styles.buttonText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.questionText}>{currentQuestion.main_question}</Text>
      {relatedQuestions.length > 0 ? renderRelatedQuestions() : renderCurrentSubQuestion()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E0F7FA',
  },
  questionText: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#00796B',
    fontFamily: 'Poppins-SemiBold',
  },
  questionTextBold: {
    fontSize: 18,
    fontWeight: '600',
    color: '#004D40',
    marginBottom: 5,
  },
  answerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    // Optional: makes the answer italic for distinction
  },
  patientInfo: {
    fontSize: 18,
    fontWeight: '500',
    color: '#00796B',
    marginBottom: 10,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#3F51B5',
  },
  subQuestionText: {
    fontSize: 20,
    marginVertical: 15,
    color: '#004D40',
  },
  answersContainer: {
    marginTop: 15,
    width: '100%',
    paddingHorizontal: 10,
  },
  answerCard: {
    backgroundColor: '#E8F5E9', // Light green background
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#757575',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 1.5,
  },
  button: {
    backgroundColor: '#3F51B5',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    width: '100%',
    elevation: 3,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    width: '100%',
    elevation: 3,
    borderColor: '#00796B',
    borderWidth: 2,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#00796B',
    textAlign: 'center',
  },

  patientInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  patientCard: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#ebf9ff', // Light green background for cards
    borderRadius: 8,
    padding: 10,
    elevation: 3,
  }
});

export default Questions;