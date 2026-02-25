
# 🛒 Babcock Campus Marketplace

A comprehensive MERN stack marketplace designed specifically for **Babcock University** students and staff. Buy, sell, and trade textbooks, electronics, and essentials within a secure campus ecosystem.

## ✨ Features

- **AI-Powered Product Management**: Automatic description generation and image analysis using Google Gemini.
- **Secure Payments**: Integrated with Paystack for seamless local transactions.
- **Live Chat**: Real-time messaging between buyers and sellers.
- **Admin Dashboard**: Full control over user status, product approvals, and sales analytics.
- **Student-Centric Design**: Categories like Textbooks, Hostel Essentials, and Food.

## 🛠️ Tech Stack

- **Frontend**: React (ESM), Tailwind CSS, Lucide Icons, Recharts.
- **Backend**: Node.js, Express.
- **Database**: MongoDB (Mongoose).
- **AI**: Google Gemini API (@google/genai).
- **Payments**: Paystack API.
- **Storage**: Cloudinary (Image uploads).

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/babcock-campus-marketplace.git
cd babcock-campus-marketplace
```

### 2. Install Dependencies
Install for both the root and the server:
```bash
npm run install-all
```

### 3. Setup Environment Variables
Create a `.env` file in the `server/` directory and add:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PAYSTACK_SECRET_KEY=your_paystack_key
CLOUDINARY_CLOUD_NAME=your_name
CORS_ALLOWED_ORIGINS=https://your-production-domain.com
VITE_REDIRECT_ALLOWLIST=https://checkout.paystack.com
REFRESH_TOKEN_EXPIRES_DAYS=30
MAX_REFRESH_TOKENS_PER_USER=5
```

### 4. Run the Application
Start both the frontend and backend simultaneously:
```bash
npm run dev
```

## 📜 License
This project is licensed under the ISC License.
