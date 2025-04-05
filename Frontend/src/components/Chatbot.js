import React, { useState } from 'react';
import '../styles/Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages([...messages, userMessage]);

        try {
            const response = await fetch('http://localhost:5000/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();

            if (data.response) {
                const botMessage = { role: 'bot', content: data.response };
                setMessages((prevMessages) => [...prevMessages, botMessage]);
            } else {
                const errorMessage = { role: 'bot', content: 'Sorry, I encountered an error.' };
                setMessages((prevMessages) => [...prevMessages, errorMessage]);
            }
        } catch (error) {
            const errorMessage = { role: 'bot', content: 'Sorry, I am unable to connect right now.' };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        }

        setInput('');
    };

    return (
        <div className="chatbot-container">
                <div className="chatbot-window">
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={msg.role === 'user' ? 'chatbot-message user' : 'chatbot-message bot'}
                            >
                                {msg.content}
                                <hr></hr>
                            </div>
                        ))}
                    </div>

                    <div className="chatbot-input">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                        />
                        <button onClick={handleSend}>Send</button>
                    </div>
                </div>
        </div>
    );
};

export default Chatbot;
