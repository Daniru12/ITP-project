import React, { useState } from "react";
import axios from "axios";

// Intent mapping for predefined responses
const intents = {
  greeting: ["hi", "hello", "hey", "good morning", "good evening"],
  farewell: ["bye", "goodbye", "see you", "later"],
  help: ["help", "assist", "support", "services", "features"],
  booking: ["book", "schedule", "appointment", "grooming", "boarding"],
  product: ["product", "inventory", "buy", "shop", "items"],
  review: ["review", "rate", "feedback", "rating"],
  advertisement: ["advertisement", "ad", "promotion", "business"],
  default: ["what", "how", "why"], // Add more patterns for default responses
};

const getIntent = (userMessage) => {
  for (const intent in intents) {
    for (const keyword of intents[intent]) {
      if (userMessage.toLowerCase().includes(keyword)) {
        return intent;
      }
    }
  }
  return "default";
};

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
      // Determine the intent of the user's message
      const intent = getIntent(message);
      
      // Get bot response based on intent
      const botResponse = generateBotResponse(intent);
      
      // Add bot response to chat
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

  // Function to generate bot response based on intent
  const generateBotResponse = (intent) => {
    switch (intent) {
      case "greeting":
        return "Hello! How can I help you today? I can assist with booking services, browsing products, and more!";
      case "farewell":
        return "Goodbye! Have a great day, and feel free to return anytime for pet care needs!";
      case "help":
        return "Here are the features I can assist with: Booking services, viewing products, reading reviews, and more!";
      case "booking":
        return "I can help you book grooming, training, or boarding services. Would you like to schedule an appointment?";
      case "product":
        return "You can browse a variety of pet products here, including toys, food, grooming supplies, and more! Let me know if you'd like to shop.";
      case "review":
        return "I can help you view and leave reviews for pet care services. Would you like to see recent reviews?";
      case "advertisement":
        return "We also offer advertising options for pet businesses. You can create ads and track their performance right here.";
      case "default":
        return "Sorry, I didn't quite get that. Could you please clarify your request?";
      default:
        return "Sorry, I couldn't process your request.";
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
        <div className="fixed bottom-5 right-5 w-96 bg-white rounded-lg shadow-lg overflow-hidden z-50">
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

          {/* Chat Body with Background Image and Scrollable View */}
          <div
            className="chat-body p-4 flex-1 overflow-auto flex flex-col gap-3 relative"
            style={{
              backgroundImage: `url('https://your-image-url.com')`, // Replace with the background image URL you want to use
              backgroundSize: 'cover', // Cover the entire container
              backgroundPosition: 'center',
              maxHeight: '400px',  // Set a fixed max height for the chat body
              minHeight: '250px'
            }}
          >
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
