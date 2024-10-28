import axios from 'axios';

// const BASE_URL = 'http://192.168.1.3:8080/questions'

export const getAllQuestions = () => axios.get('http://192.168.41.85:8082/questions');
