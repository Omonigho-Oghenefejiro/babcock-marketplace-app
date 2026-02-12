// services/geminiService.ts
import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini AI client
// You'll need to add GEMINI_API_KEY to your environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const generateProductDescription = async (productName: string, category?: string, condition?: string): Promise<string> => {
  try {
    // For development, return mock data if no API key
    if (!GEMINI_API_KEY) {
      console.warn('No Gemini API key found, using mock description');
      return getMockDescription(productName, category);
    }

    const prompt = `Generate a compelling product description for a ${condition || 'used'} ${productName} ${category ? `in the ${category} category` : ''} for a university campus marketplace. 
    Keep it concise (2-3 sentences), highlight key features, and make it appealing to students.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return response.text || getMockDescription(productName, category);
  } catch (error) {
    console.error('Error generating description:', error);
    return getMockDescription(productName, category);
  }
};

export const analyzeProductImage = async (imageFile: File): Promise<{ category?: string; condition?: string; tags?: string[] }> => {
  try {
    // For development, return mock data if no API key
    if (!GEMINI_API_KEY) {
      console.warn('No Gemini API key found, using mock image analysis');
      return getMockImageAnalysis();
    }

    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    const prompt = "Analyze this product image for a university marketplace. What category does it belong to? What condition is it in? Provide 3-5 relevant tags. Return as JSON with keys: category, condition, tags (array)";
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        { text: prompt },
        { inlineData: { mimeType: imageFile.type, data: base64Image.split(',')[1] } }
      ],
    });

    try {
      const jsonStr = response.text?.replace(/```json\n?|\n?```/g, '') || '{}';
      return JSON.parse(jsonStr);
    } catch {
      return getMockImageAnalysis();
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    return getMockImageAnalysis();
  }
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Mock functions for development
const getMockDescription = (productName: string, category?: string): string => {
  const descriptions = [
    `This ${productName} is in excellent condition and perfect for students. Well-maintained and ready for immediate use.`,
    `Great deal on this ${productName}! Ideal for campus life and comes from a smoke-free environment.`,
    `Looking for a ${productName}? This one is gently used and priced reasonably for quick sale.`
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

const getMockImageAnalysis = () => {
  const categories = ['Electronics', 'Textbooks', 'Clothing', 'Furniture', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair'];
  
  return {
    category: categories[Math.floor(Math.random() * categories.length)],
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    tags: ['campus', 'student', 'affordable', 'good condition']
  };
};

// Chat with AI Assistant
export const chatWithAssistant = async (message: string): Promise<string> => {
  try {
    console.log(`Chat with assistant: ${message}`);
    
    // Mock responses for common questions
    const mockResponses = [
      "I'm here to help you with your campus marketplace needs! You can ask me about products, selling items, or how to use the platform.",
      "To sell an item, click on the 'Sell' button in the navigation bar and fill out the form with your product details.",
      "Your cart items will be saved even if you leave the page. You can access them anytime from the cart icon.",
      "Payments are processed securely through Paystack. We never store your payment information.",
      "If you have any issues with an order, you can contact the seller directly through the messaging system."
    ];
    
    // Simple keyword-based responses
    if (message.toLowerCase().includes('sell')) {
      return "To sell an item, go to the 'Sell Item' page from your dashboard or the navigation menu. You can upload photos, set a price, and add a description. Our AI can even help generate one!";
    } else if (message.toLowerCase().includes('pay') || message.toLowerCase().includes('payment')) {
      return "We use Paystack for secure payments. You can pay with credit/debit cards, bank transfers, or USSD. All transactions are encrypted and safe.";
    } else if (message.toLowerCase().includes('shipping') || message.toLowerCase().includes('delivery')) {
      return "Since this is a campus marketplace, we recommend arranging pickup with the seller. You can coordinate meetup locations through the messaging system.";
    } else if (message.toLowerCase().includes('return')) {
      return "Returns are handled between buyers and sellers. If you have an issue with a purchase, first message the seller. If unresolved, you can open a dispute from your order history.";
    } else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      return "Hello! How can I help you with the Babcock Campus Marketplace today?";
    }
    
    // Default response
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  } catch (error) {
    console.error("Error in chatWithAssistant:", error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
};
