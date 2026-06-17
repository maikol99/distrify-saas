import api from '@/config/axios.config';

export default {
  async chat(message, chatHistory = []) {
    const response = await api.post('/assistant/chat', {
      message,
      chatHistory,
    });
    return response.data;
  },
};
