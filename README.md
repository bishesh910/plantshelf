# 🌱 Plantshelf

**Plantshelf** is a virtual plant care and tracking app built with **React (Vite)** and **Firebase**.
It allows users to add plants, set watering schedules, mark favorites, and track care history — all in a beautiful, simple interface.

---

## 🚀 Features

* **User Authentication** (Firebase Auth)
* **Add, Edit, and Delete Plants**
* **Watering Reminders** with customizable dates
* **Favorites** to quickly find your most-loved plants
* **Notes** for each plant
* **Responsive UI** designed for mobile and desktop
* **Firestore Database** for real-time updates
* **Secure API Keys** stored in `.env`

---

## 🛠️ Tech Stack

* **Frontend:** React + Vite + TypeScript
* **Styling:** TailwindCSS
* **Backend:** Firebase (Auth, Firestore)
* **Hosting:** Firebase Hosting

---

## 📦 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/plantshelf.git
   cd plantshelf
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a `.env` file**

   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

   ⚠️ **Important:**

   * Do **not** commit `.env` to GitHub.
   * Keep your Firebase API keys private (make repo private or use environment variables in deployment).

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Build for production**

   ```bash
   npm run build
   ```

---

## 🔒 Security Notes

* Avoid logging sensitive information (e.g., API keys, Auth UIDs) to the browser console.
* Ensure `.env` is listed in `.gitignore`.
* If deploying publicly, consider using Firebase security rules to protect user data.

---

## 💡 Future Ideas

* Plant care tips & AI-based recommendations
* Push notifications for watering reminders
* Plant community sharing features
