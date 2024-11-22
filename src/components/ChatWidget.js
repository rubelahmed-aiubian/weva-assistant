"use client";
import React, { useState, useEffect } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { IoChevronDownOutline } from "react-icons/io5";
import { SiChatbot } from "react-icons/si";

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);

  // Fetch categories when the chatbox is opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      fetchCategories();
    } else if (isOpen) {
      setShowCategories(true); // Ensure categories show up again when reopening
    }
  }, [isOpen]);

  // Fetch categories from the API
  const fetchCategories = async () => {
    try {
      const response = await fetch("https://weva.live/api/v3/section");
      const data = await response.json();
      setCategories(
        data.map((category) => ({ id: category.id, name: category.name }))
      );
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "Hi, Please choose a category.",
        },
      ]);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "Failed to fetch categories. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle category click
  const handleCategoryClick = async (categoryId, categoryName) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: categoryName },
    ]);
    setShowCategories(false);
    setIsTyping(true);

    try {
      const response = await fetch(
        `https://weva.live/api/v3/home/${categoryId}`
      );
      const data = await response.json();
      const stores = data.stores.slice(0, 5).map((store) => ({
        id: store.id,
        name: store.name,
        image: store.image,
        rating: store.review?.ratinng || 0,
        count: store.review?.count || 0,
      }));

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: stores, type: "stores" },
      ]);
    } catch (error) {
      console.error("Error fetching category data:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "Failed to fetch data." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle center click
  const handleCenterClick = async (storeId, centerName) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: centerName },
    ]);
    setSelectedCenter(storeId);
    setIsTyping(true);

    try {
      const response = await fetch(`https://weva.live/api/v3/center/${storeId}`);
      const data = await response.json();
      const departments = data.departments.map((department) => ({
        id: department.id,
        name: department.name,
        image: department.image,
      }));

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: departments, type: "departments" },
      ]);
    } catch (error) {
      console.error("Error fetching center data:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "Failed to fetch departments." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle department click
  const handleDepartmentClick = async (departmentId, departmentName) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: departmentName },
    ]);
    setIsTyping(true);

    try {
      const response = await fetch(
        `https://weva.live/api/v3/center/${selectedCenter}`
      );
      const data = await response.json();
      const services = data.services
        .filter((service) => service.department_ids.includes(departmentId))
        .slice(0, 5)
        .map((service) => ({
          id: service.id,
          name: service.name,
          image: service.image,
          price: service.price,
          duration: service.duration,
        }));

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: services, type: "services" },
      ]);
    } catch (error) {
      console.error("Error fetching services:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "Failed to fetch services." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle service click
  const handleServiceClick = (serviceId) => {
    window.open(`https://weva.live/en/service/${serviceId}`, "_blank");
  };

  // Handle final question
  const handleFinalQuestion = (answer) => {
    if (answer === "Yes") {
      setMessages([]);
      setShowCategories(true);
      fetchCategories();
    } else {
      setMessages([]);
      setIsOpen(false);
      setShowCategories(true);
    }
  };

  return (
    <div className="fixed bottom-5 right-5">
      {!isOpen ? (
        <div
          className="relative w-16 h-16 bg-white rounded-full shadow-lg cursor-pointer flex items-center justify-center"
          onClick={() => setIsOpen(true)}
        >
          <SiChatbot className="text-indigo-600 hover:rotate-12 transition" size={40} />
        </div>
      ) : (
        <div
          className="relative w-16 h-16 bg-white rounded-full shadow-lg cursor-pointer flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <IoChevronDownOutline className="text-indigo-600" size={40} />
        </div>
      )}

      {isOpen && (
        <div className="min-w-96 min-h-[450px] bg-white shadow-xl rounded-lg absolute bottom-20 left-[calc(100%-26rem)]">
          <div className="flex items-center gap-2 bg-indigo-600 p-2 mb-4 rounded-t-lg">
            <SiChatbot className="text-white" size={30} />
            <div>
              <h3 className="text-md font-semibold text-white">
                Weva Assistant
              </h3>
              <p className="text-xs font-normal text-white">
                Helps to book faster
              </p>
            </div>
          </div>

          <div className="p-4 overflow-y-auto max-h-80">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start mb-4 ${
                  msg.role === "user" ? "justify-start" : "justify-end"
                }`}
              >
                {msg.role === "user" ? (
                  <div className="flex items-center mb-4 justify-start">
                    <FaRegUserCircle className="text-gray-600" size={30} />
                    <div className="ml-2 max-w-xs bg-indigo-600 text-white text-sm font-normal px-4 py-1 rounded">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="max-w-xs bg-gray-100 text-sm font-normal text-gray-900 p-2 rounded">
                      {msg.type === "stores" ||
                      msg.type === "departments" ||
                      msg.type === "services" ? (
                        <div className="space-y-2">
                          {msg.content.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center p-2 bg-white shadow rounded-lg cursor-pointer"
                              onClick={() =>
                                msg.type === "stores"
                                  ? handleCenterClick(item.id, item.name)
                                  : msg.type === "departments"
                                  ? handleDepartmentClick(item.id, item.name)
                                  : handleServiceClick(item.id)
                              }
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className="ml-3">
                                <h4 className="font-medium">{item.name}</h4>
                                {item.price && (
                                  <p className="text-sm text-gray-500">
                                    {item.price} | {item.duration}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                    <SiChatbot className="text-indigo-600" size={30} />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-center mb-4">
                <div className="max-w-xs text-sm text-gray-900 p-2">
                  Please wait...
                </div>
              </div>
            )}
            {showCategories && categories.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className="text-xs text-gray-800 font-normal border border-gray-800 px-2 py-1 rounded"
                    onClick={() =>
                      handleCategoryClick(category.id, category.name)
                    }
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
            {!showCategories &&
              messages.find((msg) => msg.type === "services") && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    className="text-sm text-gray-800 font-normal border border-gray-800 px-2 py-1 rounded"
                    onClick={() => handleFinalQuestion("Yes")}
                  >
                    Yes
                  </button>
                  <button
                    className="text-sm text-gray-800 font-normal border border-gray-800 px-2 py-1 rounded"
                    onClick={() => handleFinalQuestion("No")}
                  >
                    No
                  </button>
                </div>
              )}
          </div>
          <div className="absolute bg-white bottom-0 left-0 right-0 p-4">
            <div className="flex items-center border border-gray-300 rounded-full">
              <FaRegUserCircle className="text-gray-600 p-1" size={30} />
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-grow text-black text-sm font-normal p-2 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Handle sending the message
                    const userMessage = e.target.value;
                    if (userMessage.trim()) {
                      setMessages((prevMessages) => [
                        ...prevMessages,
                        { role: "user", content: userMessage },
                      ]);
                      e.target.value = ""; 
                    }
                  }
                }}
              />
              <button
                className="bg-indigo-600 text-sm font-normal px-4 py-1 mr-1 text-white p-2 rounded-full"
                onClick={() => {
                  const userMessage = document.querySelector('input[type="text"]').value;
                  if (userMessage.trim()) {
                    setMessages((prevMessages) => [
                      ...prevMessages,
                      { role: "user", content: userMessage },
                    ]);
                    document.querySelector('input[type="text"]').value = ""; 
                  }
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;
