import React, { useState } from "react";
import axios from "axios";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);  // State to handle popup visibility

  // Handle sending the message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) return; // Ignore empty messages

    const newMessage = { sender: "user", text: message };
    setMessages([...messages, newMessage]);
    setMessage("");
    setLoading(true);

    try {
      // Send user message to the API and get the response
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyA1gukbQGocXkfvSghrfVobQR4E54iysgE",
        {
          contents: [
            {
              parts: [
                { text: message },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const botResponse = response.data.candidates[0].content.parts[0].text;
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: botResponse },
      ]);
    } catch (error) {
      console.error("Error fetching bot response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Sorry, I couldn't process your request." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Button to toggle chatbot visibility */}
      {!isOpen && (
        <button
          className="fixed bottom-5 right-5 w-16 h-16 bg-[#BC4626] rounded-full flex items-center justify-center text-white"
          onClick={() => setIsOpen(true)}
        >
          <img
            src="https://i.postimg.cc/Pf0YfTh0/piclumen-1739345684293.png"
            alt="Chatbot Icon"
            className="w-full h-full object-cover rounded-full"
          />
        </button>
      )}

      {/* Chatbot Popup */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 w-96 bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-[#BC4626] text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Logo in the header */}
              <img
                src="https://i.postimg.cc/Pf0YfTh0/piclumen-1739345684293.png"
                alt="Chatbot Logo"
                className="w-8 h-8 object-cover rounded-full"
              />
              <h1 className="text-lg font-bold">PowGo</h1>
            </div>
            <button
              className="text-2xl"
              onClick={() => setIsOpen(false)}
            >
              &#9660;
            </button>
          </div>

          {/* Chat Body */}
          <div className="chat-body p-4 h-64 overflow-auto flex flex-col gap-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message p-2 rounded-lg ${
                  msg.sender === "user" ? "bg-[#BC4626] text-white self-end" : "bg-gray-200"
                }`}
              >
                <p>{msg.text}</p>
              </div>
            ))}
            {loading && <p className="text-gray-500 text-sm">Bot is typing...</p>}
          </div>

          {/* Chat Footer */}
          <div className="chat-footer p-4 bg-white border-t-2">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-2 border rounded-md"
              />
              <button
                type="submit"
                className="bg-[#BC4626] text-white p-2 rounded-full"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
