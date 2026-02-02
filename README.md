# FinTrack - Client Application

FinTrack is a responsive financial analytics dashboard built to provide real-time insights into personal finance. This frontend application focuses on data visualization, secure state management, and robust data portability.

## 🚀 Live Demo
**Application:** https://money-manager-frontend-hazel.vercel.app
**Video Walkthrough:** https://drive.google.com/file/d/1rrcGb1uYigelDqbdn_1vnHLXF8wW9h3Z/view?usp=drive_link

## 🛠️ Tech Stack
* **Framework:** React.js (Vite)
* **Styling:** Tailwind CSS, Framer Motion (Animations)
* **Charts:** Recharts (Time-series data visualization)
* **HTTP Client:** Axios (with Interceptors)
* **Icons:** Lucide React

## 💡 Key Engineering Features

### 1. Advanced Data Visualization
* Implemented a dynamic **Time-Series Chart** that adapts granularity based on user selection:
    * **Monthly View:** Shows daily breakdown (1st-31st).
    * **Yearly View:** Shows monthly aggregates (Jan-Dec).
* **Solved Edge Case:** Fixed rendering issues for sparse datasets (single data points) by implementing forced dot rendering in Area Charts.

### 2. Strict Data Filtering
* Architected a **Timezone-Safe Filter Logic**. 
* Instead of relying on browser local time, the app performs strict string-based comparisons (`YYYY-MM-DD`) to ensure transaction data remains accurate regardless of the user's location.

### 3. Binary CSV Export
* Replaced standard URI encoding with a **Binary Blob Strategy** for CSV exports.
* This ensures that special characters, commas in descriptions, and large datasets are exported to Excel without formatting corruption.

## ⚙️ Local Setup

1.  Clone the repository:
    ```bash
    git clone [your-frontend-repo-link]
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

---
*Developed by Kavya S*
