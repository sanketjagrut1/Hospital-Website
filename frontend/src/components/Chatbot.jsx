import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            loadChatHistory();
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadChatHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('http://localhost:4000/api/chatbot/history', {
                headers: { token }
            });

            if (response.data.success) {
                setMessages(response.data.messages);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to use the chatbot');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:4000/api/chatbot/message', 
                { message: inputMessage },
                { headers: { token } }
            );

            if (response.data.success) {
                setMessages(prev => [...prev, 
                    { role: 'user', content: inputMessage },
                    { role: 'assistant', content: response.data.response }
                ]);
                setInputMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            {!isOpen && (
                <button 
                    className="chatbot-button"
                    onClick={() => setIsOpen(true)}
                >
                    <FaRobot />
                </button>
            )}

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>MediLink Assistant</h3>
                        <button 
                            className="close-button"
                            onClick={() => setIsOpen(false)}
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.length === 0 ? (
                            <div className="welcome-message">
                                Hello! I'm your MediLink assistant. How can I help you today?
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <div 
                                    key={index} 
                                    className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                                >
                                    {message.content}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="chatbot-input">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type your message..."
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading}>
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot; 