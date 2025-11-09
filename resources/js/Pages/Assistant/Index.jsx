// resources/js/Pages/Assistant/Index.jsx

import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios'; // We'll use axios for clean API calls

// A reusable component for displaying a single chat bubble
const MessageBubble = ({ sender, text }) => {
    const isUser = sender === 'user';
    const bubbleClasses = isUser
        ? 'bg-blue-500 text-white self-end'
        : 'bg-gray-200 text-gray-800 self-start';
    
    // Replace newline characters with <br> tags for proper formatting
    const formattedText = (text || '').split('\n').map((line, index) => (
        <React.Fragment key={index}>
            {line}
            <br />
        </React.Fragment>
    ));

    return (
        <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl p-4 my-2 rounded-lg shadow ${bubbleClasses}`}>
                {formattedText}
            </div>
        </div>
    );
};

export default function Index({ auth }) {
    // State to hold the entire conversation history
    const [conversation, setConversation] = useState([
        { sender: 'ai', text: 'Hello! I am Spark, your creative assistant. How can I help you with your film project today?' }
    ]);
    // State to hold the user's current input
    const [prompt, setPrompt] = useState('');
    // State to manage the loading indicator
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return; // Don't send empty messages

        // 1. Optimistic UI update: Add user's message immediately
        const userMessage = { sender: 'user', text: prompt };
        setConversation(prev => [...prev, userMessage]);
        setPrompt(''); // Clear the input field
        setIsLoading(true);

        try {
            // 2. Make the API call to our Laravel backend
            const response = await axios.post(route('ai.chat'), { prompt });

            // 3. Add the AI's response to the conversation
            const aiMessage = { sender: 'ai', text: response.data.reply };
            setConversation(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("Error communicating with the AI assistant:", error);
            const errorMessage = { sender: 'ai', text: 'Sorry, I am having trouble connecting right now. Please try again later.' };
            setConversation(prev => [...prev, errorMessage]);
        } finally {
            // 4. Hide the loading indicator
            setIsLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Spark AI Assistant</h2>}
        >
            <Head title="Spark Assistant" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg flex flex-col h-[70vh]">
                        
                        {/* Message Display Area */}
                        <div className="flex-1 p-6 overflow-y-auto flex flex-col">
                            {conversation.map((msg, index) => (
                                <MessageBubble key={index} sender={msg.sender} text={msg.text} />
                            ))}
                            {isLoading && (
                                <div className="self-start p-4 my-2 rounded-lg shadow bg-gray-200 text-gray-800">
                                    Spark is thinking...
                                </div>
                            )}
                        </div>

                        {/* Input Form Area */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                            <form onSubmit={handleSubmit} className="flex gap-4">
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Ask Spark for script ideas, a shot list, or a movie title..."
                                    className="input flex-1 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm"
                                    disabled={isLoading}
                                />
                                <button type="submit" className="btn btn-primary bg-blue-500 text-white p-2 rounded-md" disabled={isLoading}>
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}