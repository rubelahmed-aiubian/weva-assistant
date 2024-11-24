"use client";
import React, { useState, useEffect } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { IoChevronDownOutline } from "react-icons/io5";
import { SiChatbot } from "react-icons/si";
import apiService from "@/services/apiService";
import Image from "next/image";

function ChatWidget() {
  const [locale, setLocale] = useState("en");
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          type: "greeting",
        },
      ]);
    }
  }, [isOpen, locale]);

  const handleLanguageSelection = (language) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "user",
        content: language === "en" ? "English" : "Arabic",
      },
      {
        role: "assistant",
        type: "categoryPrompt",
      },
    ]);
    setLocale(language);
    fetchCategories(language);
  };

  const fetchCategories = async (language) => {
    try {
      const data = await apiService.fetchCategories(language);
      setCategories(
        data.map((category) => ({ id: category.id, name: category.name }))
      );
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "Failed to fetch categories. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
      setShowCategories(true);
    }
  };

  const handleCategoryClick = async (categoryId, categoryName) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: categoryName },
    ]);
    setShowCategories(false);
    setIsTyping(true);

    try {
      const data = await apiService.fetchCategoryData(categoryId, locale);

      // Process store data
      const stores = Array.isArray(data.stores)
        ? data.stores.slice(0, 5).map((store) => ({
            id: store.id,
            name: store.name,
            image: store.image,
            rating: store.review?.rating || 0,
            count: store.review?.count || 0,
          }))
        : []; // Default to an empty array if undefined

      // Add raw stores data to messages
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          type: "stores",
          stores: stores,
        },
      ]);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "Failed to fetch data." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCenterClick = async (storeId, centerName) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: centerName },
    ]);
    setSelectedCenter(storeId);
    setIsTyping(true);

    try {
      const data = await apiService.fetchCenterData(storeId, locale);

      // Check if data.departments is defined and is an array
      const departments = Array.isArray(data.departments)
        ? data.departments.map((department) => ({
            id: department.id,
            name: department.name,
            image: department.image,
          }))
        : [];
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: departments, type: "departments" },
      ]);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "Failed to fetch departments." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDepartmentClick = async (departmentId, departmentName) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: departmentName },
    ]);
    setIsTyping(true);

    try {
      const services = await apiService.fetchServicesForDepartment(
        selectedCenter,
        departmentId,
        locale
      );

      // Process services to extract relevant information
      const servicesList = Array.isArray(services)
        ? services.map((service) => ({
            id: service.id,
            name: service.name,
            price: service.price,
            image: service.image,
          }))
        : []; // Fallback to an empty array if services is not an array

      // Add services to messages for display
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          type: "services",
          services: servicesList, // Pass services list directly here
        },
      ]);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "Failed to fetch services." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleServiceClick = (serviceId) => {
    window.open(`https://weva.live/en/service/${serviceId}`, "_blank");
  };

  const handleFinalQuestion = (answer) => {
    if (answer === "Yes") {
      setShowCategories(true);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          type: "categoryPrompt",
        },
      ]);
    } else {
      setMessages([]);
      setIsOpen(false);
      setShowCategories(false);
    }
  };

  const switchCategory = () => {
    setShowCategories(true);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "assistant",
        type: "categoryPrompt",
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5">
      {/* Chat box opening */}
      {!isOpen ? (
        <div
          className="relative w-16 h-16 bg-white rounded-full shadow-lg cursor-pointer flex items-center justify-center hover:rotate-12 transition"
          onClick={() => setIsOpen(true)}
        >
          <Image
            src="/images/logo-red.png"
            height={50}
            width={50}
            alt="Weva Logo"
          />
          <div className="absolute bg-green-500 w-3 h-3 rounded-full top-1 left-1"></div>
        </div>
      ) : (
        <div
          className="relative w-16 h-16 bg-white rounded-full shadow-lg cursor-pointer flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <IoChevronDownOutline className="text-red-400" size={40} />
        </div>
      )}

      {isOpen && (
        <div className="min-w-96 min-h-[450px] bg-white shadow-xl rounded-lg absolute bottom-20 left-[calc(100%-26rem)]">
          <div className="flex items-center gap-2 bg-red-400 p-2 mb-4 rounded-t-lg">
            <Image
              src="/images/logo-white.png"
              height={40}
              width={40}
              alt="Weva Logo"
            />

            <div>
              <h3 className="text-md font-semibold text-white">
                Weva Assistant
              </h3>
              <p className="text-xs font-normal text-white">
                {locale === "en"
                  ? "Helps to book faster"
                  : "يساعد على الحجز بشكل أسرع"}
              </p>
            </div>
          </div>

          {/* Conversation flow */}
          <div className="p-4 overflow-y-auto max-h-80">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start mb-4 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "user" ? (
                  <div className="flex items-center mb-4 justify-start">
                    <div className="mr-2 max-w-xs bg-red-400 text-white text-sm font-normal px-4 py-1 rounded">
                      {msg.content}
                    </div>
                    <FaRegUserCircle className="text-gray-600" size={30} />
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <SiChatbot className="text-red-400" size={30} />
                    <div className="max-w-xs bg-gray-100 text-sm font-normal text-gray-900 p-2 rounded">
                      {msg.type === "greeting" ? (
                        <div className="space-y-2 text-left">
                          <p>
                            {locale === "en"
                              ? "Hi, I am Ryan! I am designed to make your booking faster. Please choose a language to continue..."
                              : "مرحبًا، أنا مساعد Weva. أنا مصمم لجعل الحجز الخاص بك أسرع. يرجى اختيار لغة للمتابعة..."}
                          </p>
                          <div className="flex justify-center space-x-2">
                            <button
                              className="text-sm bg-red-400 text-white font-normal px-2 py-1 rounded"
                              onClick={() => handleLanguageSelection("en")}
                            >
                              English
                            </button>
                            <button
                              className="text-sm bg-red-400 text-white font-normal px-2 py-1 rounded"
                              onClick={() => handleLanguageSelection("ar")}
                            >
                              Arabic
                            </button>
                          </div>
                        </div>
                      ) : msg.type === "categoryPrompt" ? (
                        <div className="text-left">
                          {locale === "en"
                            ? "Please choose a category"
                            : "الرجاء اختيار فئة"}
                        </div>
                      ) : msg.type === "stores" ? (
                        <div>
                          <p className="mb-2">
                            {locale === "en"
                              ? "Please choose a center"
                              : "الرجاء اختيار المركز"}
                          </p>
                          {Array.isArray(msg.stores) &&
                          msg.stores.length > 0 ? (
                            msg.stores.map((store) => (
                              <div
                                key={store.id}
                                className="bg-white rounded shadow p-4 mb-2 cursor-pointer"
                                onClick={() =>
                                  handleCenterClick(store.id, store.name)
                                }
                              >
                                <div className="flex items-center">
                                  <img
                                    src={store.image}
                                    alt={store.name}
                                    className="w-10 h-10 rounded"
                                  />
                                  <div className="ml-2">
                                    <p className="font-semibold">
                                      {store.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {store.rating > 0 ? (
                                        Array.from(
                                          { length: store.rating },
                                          (_, index) => (
                                            <span
                                              key={index}
                                              className="text-red-400"
                                            >
                                              ★
                                            </span>
                                          )
                                        )
                                      ) : (
                                        <p>
                                          {locale === "en"
                                            ? "Not rated yet"
                                            : "لم يتم تقييمه بعد"}
                                        </p>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p>
                              {locale === "en"
                                ? "No center available"
                                : "لا يوجد مركز متاح"}
                            </p>
                          )}
                          <div className="flex justify-center">
                            {" "}
                            <button 
                            className="bg-red-400 rounded px-2 py-1 text-white"
                            onClick={() => switchCategory()}
                            >
                              {locale ==="en" ? "Change Category" : "تغيير الفئة"}
                            </button>
                          </div>
                        </div>
                      ) : msg.type === "departments" ? (
                        <div>
                          <p className="mb-2">
                            {locale === "en"
                              ? "Please choose a department"
                              : "الرجاء اختيار القسم"}
                          </p>
                          {Array.isArray(msg.content) &&
                          msg.content.length > 0 ? (
                            msg.content.map((department) => (
                              <div
                                key={department.id}
                                className="flex items-center p-2 bg-white shadow rounded-lg cursor-pointer mb-2"
                                onClick={() =>
                                  handleDepartmentClick(
                                    department.id,
                                    department.name
                                  )
                                }
                              >
                                <img
                                  src={department.image}
                                  alt={department.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="ml-3">
                                  <h4 className="font-medium">
                                    {department.name}
                                  </h4>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p>
                              {locale === "en"
                                ? "No departments available"
                                : "لا توجد أقسام متاحة"}
                            </p>
                          )}
                        </div>
                      ) : msg.type === "services" ? (
                        <div>
                          <p className="mb-2">
                            {" "}
                            {locale === "en"
                              ? "Please choose a service"
                              : "الرجاء اختيار الخدمة"}
                          </p>
                          {Array.isArray(msg.services) &&
                          msg.services.length > 0 ? (
                            msg.services.map((service) => (
                              <div
                                key={service.id}
                                className="bg-white rounded shadow p-4 mb-2 cursor-pointer"
                                onClick={() => handleServiceClick(service.id)}
                              >
                                <div className="flex items-center">
                                  <img
                                    src={service.image}
                                    alt={service.name}
                                    className="w-10 h-10 rounded"
                                  />
                                  <div className="ml-2">
                                    <p className="font-semibold">
                                      {service.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {service.price}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p>
                              {locale === "en"
                                ? "No services available"
                                : "لا توجد خدمات متاحة"}
                            </p>
                          )}
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-center mb-4">
                <div className="max-w-xs text-sm text-gray-900 p-2">
                  Please wait...
                </div>
              </div>
            )}

            {/* Display categories after language selection */}
            {showCategories && categories.length > 0 && locale && (
              <div className="flex flex-col gap-2 flex-start max-w-44 bg-gray-100 rounded  p-2 ml-10">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className="text-sm bg-red-400 text-white font-normal px-2 py-1 rounded"
                    onClick={() =>
                      handleCategoryClick(category.id, category.name)
                    }
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}

            {/* Final question buttons */}
            {!showCategories &&
              messages.find((msg) => msg.type === "services") && (
                <div className="flex flex-col gap-2">
                  <button
                    className="text-sm bg-red-400 text-white font-normal px-2 py-1 rounded"
                    onClick={() => handleFinalQuestion("Yes")}
                  >
                    Book More
                  </button>
                  <button
                    className="text-sm bg-red-400 text-white font-normal px-2 py-1 rounded"
                    onClick={() => handleFinalQuestion("No")}
                  >
                    End Chat
                  </button>
                </div>
              )}
          </div>

          {/* User Input Section */}
          <div className="absolute bg-white bottom-0 left-0 right-0 p-4">
            <div className="flex items-center border border-gray-300 rounded-full">
              <FaRegUserCircle className="text-gray-600 p-1" size={30} />
              <input
                type="text"
                placeholder={
                  locale === "en" ? "Type your message here" : "اكتب رسالتك هنا"
                }
                className="flex-grow text-black text-sm font-normal p-2 outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
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
                className="bg-red-400 text-sm font-normal px-4 py-1 mr-1 text-white p-2 rounded-full"
                onClick={() => {
                  const userMessage =
                    document.querySelector('input[type="text"]').value;
                  if (userMessage.trim()) {
                    setMessages((prevMessages) => [
                      ...prevMessages,
                      { role: "user", content: userMessage },
                    ]);
                    document.querySelector('input[type="text"]').value = "";
                  }
                }}
              >
                {locale === "en" ? "Send" : "يرسل"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;
