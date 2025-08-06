import chatbotModel from "../models/chatbotModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

// Function to process user message and generate response
const processMessage = async (message, userId) => {
    try {
        // Convert message to lowercase for easier matching
        const userMessage = message.toLowerCase();

        // Find or create conversation
        let conversation = await chatbotModel.findOne({ userId });
        if (!conversation) {
            conversation = new chatbotModel({ userId, messages: [] });
        }

        // Add user message to conversation
        conversation.messages.push({
            role: 'user',
            content: message
        });

        // Generate response based on message content
        let response = '';
        
        if (userMessage.includes('hello') || userMessage.includes('hi')) {
            response = 'Hello! How can I help you today?';
        }
        else if (userMessage.includes('appointment') || userMessage.includes('book')) {
            response = 'To book an appointment, please go to the "Book Appointment" section and select your preferred doctor and time slot.';
        }
        else if (userMessage.includes('doctor') || userMessage.includes('specialist')) {
            const doctors = await doctorModel.find({}).select(['name', 'speciality']);
            response = 'Here are our available specialists:\n' + 
                      doctors.map(doc => `- Dr. ${doc.name} (${doc.speciality})`).join('\n');
        }
        else if (userMessage.includes('cancel') || userMessage.includes('reschedule')) {
            response = 'To cancel or reschedule an appointment, please go to "My Appointments" section and select the appointment you want to modify.';
        }
        else if (userMessage.includes('payment') || userMessage.includes('pay')) {
            response = 'We accept payments through Stripe and Razorpay. You can pay after booking your appointment.';
        }
        else if (userMessage.includes('contact') || userMessage.includes('help')) {
            response = 'You can contact our support team at support@medilink.com or call us at +1-234-567-8900.';
        }
        else {
            response = "I'm sorry, I don't understand. Could you please rephrase your question? You can ask me about appointments, doctors, payments, or contact information.";
        }

        // Add assistant response to conversation
        conversation.messages.push({
            role: 'assistant',
            content: response
        });

        // Update conversation timestamp
        conversation.updatedAt = new Date();
        await conversation.save();

        return { success: true, response };

    } catch (error) {
        console.log(error);
        return { success: false, message: error.message };
    }
};

// Get conversation history
const getConversationHistory = async (userId) => {
    try {
        const conversation = await chatbotModel.findOne({ userId });
        if (!conversation) {
            return { success: true, messages: [] };
        }
        return { success: true, messages: conversation.messages };
    } catch (error) {
        console.log(error);
        return { success: false, message: error.message };
    }
};

export { processMessage, getConversationHistory }; 