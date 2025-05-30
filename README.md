# EmojiTetriz

EmojiTetriz is a fun and modern take on the classic Tetris game, built with Next.js and featuring customizable emoji-styled pieces, themes, and AI-powered soundtrack suggestions.

This project was bootstrapped in Firebase Studio.

## Features

*   Classic Tetris gameplay with responsive design.
*   Emoji-styled pieces with customizable sets via theme sharing.
*   Light and Dark mode support.
*   **Hold Piece** functionality to strategize your moves.
*   **Gamepad Support** with remappable controls for a console-like experience.
*   **Fun Box Extras** (toggleable in Settings):
    *   Confetti animations for line clears and level-ups.
    *   **Draw Your Own Minoes**: Create, save, and play with your custom-designed Tetris pieces!
*   **Multilingual Support**: Play in English, Portuguese, Spanish, French, or German.
*   **AI Soundtrack Suggestions**: Get music ideas powered by Genkit based on your game state.

## Tech Stack

*   Next.js (App Router)
*   React
*   TypeScript
*   ShadCN UI Components
*   Tailwind CSS
*   Genkit (for AI-powered features)
*   Lucide Icons

## Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn

### Installation & Running Locally

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd EmojiTetriz # Or your repository's directory name
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of your project (or `.env.local` for local overrides). If you are using Genkit with Google AI models that require an API key, you'll need to add it here:
    ```env
    # .env or .env.local
    GOOGLE_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY
    ```
    Other Genkit plugins or AI models might require different environment variables.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on [http://localhost:9002](http://localhost:9002).

5.  **(Optional) Run Genkit Developer UI:**
    To inspect and test your Genkit flows, you can run the Genkit developer UI:
    ```bash
    npm run genkit:dev
    ```
    This typically starts on [http://localhost:4000](http://localhost:4000).

## About Our Default Custom Minoes

Meet our default custom minoes, Jorge and Luka!

*   **Luka** (🔴): He's small and just wants to play! His simple 3-node matrix makes him easy and pleasant to place.
*   **Jorge** (🈂️): He WILL MAKE YOU PAY! Jorge is a complex piece made out of the Japanese tax emoji – handle with care!

(You can find them in Settings > Fun Box > Manage Custom Minoes if you enable the "Enable Custom Minoes" feature and your custom mino list is empty.)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
