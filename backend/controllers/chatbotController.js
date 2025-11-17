// // import chatbotModel from "../models/chatbotModel.js";
// // import doctorModel from "../models/doctorModel.js";
// // import appointmentModel from "../models/appointmentModel.js";

// // // Function to process user message and generate response
// // const processMessage = async (message, userId) => {
// //     try {
// //         // Convert message to lowercase for easier matching
// //         const userMessage = message.toLowerCase();

// //         // Find or create conversation
// //         let conversation = await chatbotModel.findOne({ userId });
// //         if (!conversation) {
// //             conversation = new chatbotModel({ userId, messages: [] });
// //         }

// //         // Add user message to conversation
// //         conversation.messages.push({
// //             role: 'user',
// //             content: message
// //         });

// //         // Generate response based on message content
// //         let response = '';
        
// //         if (userMessage.includes('hello') || userMessage.includes('hi')) {
// //             response = 'Hello! How can I help you today?';
// //         }
// //         else if (userMessage.includes('appointment') || userMessage.includes('book')) {
// //             response = 'To book an appointment, please go to the "Book Appointment" section and select your preferred doctor and time slot.';
// //         }
// //         else if (userMessage.includes('doctor') || userMessage.includes('specialist')) {
// //             const doctors = await doctorModel.find({}).select(['name', 'speciality']);
// //             response = 'Here are our available specialists:\n' + 
// //                       doctors.map(doc => `- Dr. ${doc.name} (${doc.speciality})`).join('\n');
// //         }
// //         else if (userMessage.includes('cancel') || userMessage.includes('reschedule')) {
// //             response = 'To cancel or reschedule an appointment, please go to "My Appointments" section and select the appointment you want to modify.';
// //         }
// //         else if (userMessage.includes('payment') || userMessage.includes('pay')) {
// //             response = 'We accept payments through Stripe and Razorpay. You can pay after booking your appointment.';
// //         }
// //         else if (userMessage.includes('contact') || userMessage.includes('help')) {
// //             response = 'You can contact our support team at support@medilink.com or call us at +1-234-567-8900.';
// //         }
// //         else {
// //             response = "I'm sorry, I don't understand. Could you please rephrase your question? You can ask me about appointments, doctors, payments, or contact information.";
// //         }

// //         // Add assistant response to conversation
// //         conversation.messages.push({
// //             role: 'assistant',
// //             content: response
// //         });

// //         // Update conversation timestamp
// //         conversation.updatedAt = new Date();
// //         await conversation.save();

// //         return { success: true, response };

// //     } catch (error) {
// //         console.log(error);
// //         return { success: false, message: error.message };
// //     }
// // };

// // // Get conversation history
// // const getConversationHistory = async (userId) => {
// //     try {
// //         const conversation = await chatbotModel.findOne({ userId });
// //         if (!conversation) {
// //             return { success: true, messages: [] };
// //         }
// //         return { success: true, messages: conversation.messages };
// //     } catch (error) {
// //         console.log(error);
// //         return { success: false, message: error.message };
// //     }
// // };

// // export { processMessage, getConversationHistory }; 

// // backend/controller.js
// import chatbotModel from "../models/chatbotModel.js";
// import doctorModel from "../models/doctorModel.js";
// import appointmentModel from "../models/appointmentModel.js";
// import axios from "axios"; // 👈 IMPORT AXIOS HERE

// // Define the Flask API URL
// const FLASK_API_URL = 'http://127.0.0.1:5000/predict'; 

// // Function to process user message and generate response
// const processMessage = async (message, userId) => {
//     try {
//         const userMessage = message.toLowerCase();

//         // Find or create conversation... 
//         let conversation = await chatbotModel.findOne({ userId });
//         if (!conversation) {
//             conversation = new chatbotModel({ userId, messages: [] });
//         }

//         // Add user message to conversation
//         conversation.messages.push({
//             role: 'user',
//             content: message
//         });

//         let response = '';
        
//         // Existing Keyword Responses 
//         if (userMessage.includes('hello') || userMessage.includes('hi')) {
//             response = 'Hello! How can I help you today?';
//         }
//         else if (userMessage.includes('contact') || userMessage.includes('help')) {
//             response = 'You can contact our support team at support@medilink.com or call us at +1-234-567-8900.';
//         }
        
//         // NEW LOGIC: Call Flask API for Symptom Prediction
//         else {
//             try {
//                 // Send the message to the Flask API
//                 const flaskResponse = await axios.post(FLASK_API_URL, {
//                     symptoms: message // The Flask API expects a 'symptoms' field
//                 });

//                 const { disease, doctor_type, urgency, error, info } = flaskResponse.data;

//                 if (error) {
//                     // Handle symptom validation error from Flask (e.g., unknown symptom)
//                     response = `⚠️ **Prediction Error:** ${error} ${info || ''}`;
//                 } else {
//                     // Success: Format the structured prediction data into a readable response
//                     response = `
//                         **Prediction Results:**
                        
//                         - **🦠 Disease:** ${disease}
//                         - **👨‍⚕️ Recommended Doctor:** ${doctor_type}
//                         - **🚨 Urgency Level:** ${urgency}
                        
//                         _This prediction is based on the symptoms you provided. Please consult a professional for a definitive diagnosis._
//                     `.trim();
//                 }

//             } catch (flaskError) {
//                 console.error("Error communicating with Flask API:", flaskError.message);
                
//                 // Handle connection errors or internal server errors from Flask
//                 let flaskErrorMessage = "I'm sorry, the symptom prediction service is currently unavailable. Please try again later.";
                
//                 if (flaskError.response && flaskError.response.data && flaskError.response.data.error) {
//                     flaskErrorMessage = `Prediction Service Error: ${flaskError.response.data.error}`;
//                 }

//                 response = flaskErrorMessage;
//             }
//         }

//         // Add assistant response to conversation
//         conversation.messages.push({
//             role: 'assistant',
//             content: response
//         });

//         conversation.updatedAt = new Date();
//         await conversation.save();

//         return { success: true, response };

//     } catch (error) {
//         console.log(error);
//         return { success: false, message: error.message };
//     }
// };

// // 👈 MISSING FUNCTION ADDED HERE
// // Get conversation history
// const getConversationHistory = async (userId) => {
//     try {
//         const conversation = await chatbotModel.findOne({ userId });
//         if (!conversation) {
//             return { success: true, messages: [] };
//         }
//         return { success: true, messages: conversation.messages };
//     } catch (error) {
//         console.log(error);
//         return { success: false, message: error.message };
//     }
// };


// export { processMessage, getConversationHistory };

// backend/controllers/chatbotController.js
import chatbotModel from "../models/chatbotModel.js";
import axios from "axios";

const FLASK_API_URL = process.env.FLASK_API_URL || "http://127.0.0.1:5000/predict";

/**
 * Resolve userId from possible places.
 * Accepts null (will not save conversation if null).
 */
const resolveUserId = (reqOrUserId) => {
  if (!reqOrUserId) return null;
  if (typeof reqOrUserId === "string") return reqOrUserId;
  // assume it's express req
  const req = reqOrUserId;
  return req.userId || req.body?.userId || req.query?.userId || null;
};

const saveConversation = async (userId, role, content) => {
  if (!userId) return; // do not save if user not provided
  try {
    let conv = await chatbotModel.findOne({ userId });
    if (!conv) conv = new chatbotModel({ userId, messages: [] });
    conv.messages.push({ role, content, timestamp: new Date() });
    conv.updatedAt = new Date();
    await conv.save();
  } catch (err) {
    console.error("saveConversation error:", err);
  }
};

const formatAssistantMessage = (payload) => {
  // Build readable multi-line assistant message from flask payload.
  // payload may include disease, doctor_type, urgency, confidences, mapped_tokens, warning, low_confidence, note
  if (!payload) return "Sorry, I couldn't generate a response.";

  if (payload.error) {
    // structured error from Flask
    if (payload.unknown_tokens) {
      return `⚠️ Unknown symptom tokens: ${payload.unknown_tokens.join(", ")}. ${payload.info || ""}`;
    }
    return `⚠️ Prediction error: ${payload.error}. ${payload.info || ""}`;
  }

  const lines = [];
  lines.push("**Prediction Results:**");
  lines.push("");
  lines.push(`🦠 Disease: ${payload.disease || "Unknown"}${payload.confidences?.disease_confidence ? ` (confidence: ${Number(payload.confidences.disease_confidence).toFixed(2)})` : ""}`);
  lines.push(`👨‍⚕️ Recommended Doctor: ${payload.doctor_type || "General Physician"}${payload.confidences?.doctor_confidence ? ` (confidence: ${Number(payload.confidences.doctor_confidence).toFixed(2)})` : ""}`);
  lines.push(`🚨 Urgency Level: ${payload.urgency || "Normal"}${payload.confidences?.urgency_confidence ? ` (confidence: ${Number(payload.confidences.urgency_confidence).toFixed(2)})` : ""}`);
  if (payload.mapped_tokens && Object.keys(payload.mapped_tokens).length > 0) {
    const mappedPairs = Object.entries(payload.mapped_tokens).map(([k, v]) => `${k}→${v}`).join(", ");
    lines.push("");
    lines.push(`🔁 Mapped tokens: ${mappedPairs}`);
  }
  if (payload.low_confidence) {
    lines.push("");
    lines.push("_Note: Prediction confidence is low. Please provide more specific symptoms or separate them with commas._");
  }
  if (payload.warning) {
    lines.push("");
    lines.push(`⚠️ ${payload.warning}`);
  }
  lines.push("");
  lines.push("_This is an automated prediction; consult a licensed medical professional for a definitive diagnosis._");

  return lines.join("\n");
};

const processMessage = async (message, userIdOrReq) => {
  try {
    const userId = resolveUserId(userIdOrReq);
    const userMessage = String(message || "").trim();
    if (!userMessage) {
      return { success: false, message: "Message empty" };
    }

    // Save user message (if userId exists)
    await saveConversation(userId, "user", userMessage);

    // Quick intent handling: small greetings & contact (do not block ML)
    const lowPriorityGreeting = /(^|\s)(hi|hello|hey|good morning|good evening)(\s|$)/i;
    const contactRegex = /\b(contact|help|support)\b/i;

    if (lowPriorityGreeting.test(userMessage) && userMessage.length < 60) {
      const reply = "Hello! Please describe your symptoms (e.g., 'fever, cough') or ask about appointments/doctors.";
      await saveConversation(userId, "assistant", reply);
      return { success: true, response: reply };
    }

    if (contactRegex.test(userMessage) && userMessage.length < 150) {
      const reply = "You can contact our support team at support@medilink.com or call +1-234-567-8900.";
      await saveConversation(userId, "assistant", reply);
      return { success: true, response: reply };
    }

    // Call Flask prediction service
    let flaskRes;
    try {
      flaskRes = await axios.post(FLASK_API_URL, { symptoms: userMessage }, { timeout: 12000 });
    } catch (fe) {
      console.error("Error calling Flask API:", fe?.message || fe);
      const fallback = "Sorry — the symptom prediction service is currently unavailable. You can still ask about appointments, doctors, or try again later.";
      await saveConversation(userId, "assistant", fallback);
      return { success: true, response: fallback };
    }

    const payload = flaskRes.data || {};
    // If flask payload indicates unknown tokens (422), surface suggestions
    if (payload.error && payload.unknown_tokens) {
      // message that helps user rephrase
      const assistantMsg = `⚠️ Unknown symptom(s): ${payload.unknown_tokens.join(", ")}. Try rephrasing, using commas, or spelling corrections. Suggestions: ${JSON.stringify(payload.suggestions || {})}`;
      await saveConversation(userId, "assistant", assistantMsg);
      return { success: true, response: assistantMsg };
    }

    // Format clean assistant message and save
    const assistantMessage = formatAssistantMessage(payload);
    await saveConversation(userId, "assistant", assistantMessage);

    return { success: true, response: assistantMessage };

  } catch (err) {
    console.error("processMessage error:", err);
    return { success: false, message: err.message || "Internal server error" };
  }
};

const getConversationHistory = async (userIdOrReq) => {
  try {
    const userId = (typeof userIdOrReq === 'string') ? userIdOrReq : (userIdOrReq?.userId || userIdOrReq?.query?.userId || userIdOrReq?.userId);
    if (!userId) return { success: true, messages: [] };
    const conversation = await chatbotModel.findOne({ userId });
    if (!conversation) return { success: true, messages: [] };
    return { success: true, messages: conversation.messages || [] };
  } catch (err) {
    console.error("getConversationHistory error:", err);
    return { success: false, message: err.message || "Internal server error" };
  }
};

export { processMessage, getConversationHistory };
