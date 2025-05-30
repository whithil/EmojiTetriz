
# EmojiTetriz

EmojiTetriz is a fun and modern take on the classic Tetris game, built with Next.js and featuring customizable emoji-styled pieces and themes.

<!-- Placeholder for a GIF of the game in action -->
<!-- ![EmojiTetriz Gameplay GIF](https://example.com/path-to-your-gameplay.gif) -->

This project was bootstrapped in Firebase Studio.

## Features

*   Classic Tetris gameplay with responsive design.
*   Emoji-styled pieces with customizable sets via theme sharing.
*   Light and Dark mode support.
*   **Hold Piece** functionality to strategize your moves.
*   **Gamepad Support** with remappable controls for a console-like experience.
*   **Fun Box Extras** (toggleable in Settings):
    *   Confetti animations for line clears and level-ups.
    *   **Draw Your Own Minoes**: Create, save, and play with your custom-designed Tetris pieces! (Meet our defaults, Jorge and Luka, below!)
*   **Multilingual Support**: Play in English, Portuguese, Spanish, French, or German.

## Tech Stack

*   Next.js (App Router)
*   React
*   TypeScript
*   ShadCN UI Components
*   Tailwind CSS
*   Lucide Icons
*   Genkit (for potential future AI features)

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

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This command uses `next dev --turbopack -p 9002` as defined in `package.json`.
    The application should now be running on [http://localhost:9002](http://localhost:9002) (or your configured port).

### Building for Production

To create an optimized production build of your application, run:
```bash
npm run build
```
This command compiles your Next.js app and outputs the build artifacts to the `.next` directory (or `out` directory if `output: 'export'` is used in `next.config.ts`).

### Running the Production Build Locally

After building, you can start the production server using:
```bash
npm run start
```
This will serve the optimized version of your app.

**Note on Deployment:** While this app can be configured for static export (`output: 'export'` in `next.config.ts`) for deployment on platforms like GitHub Pages, this will remove any server-side Next.js features. For a full-featured Next.js application with server-side logic (e.g., if you re-add AI features with Genkit), you'll need a hosting platform that supports Node.js, such as Vercel, Netlify, Firebase Hosting (with Cloud Functions/Run), AWS Amplify, etc.

## About Our Default Custom Minoes

Meet our default custom minoes, Jorge and Luka! You can find them in `Settings > Fun Box > Manage Custom Minoes` if you enable the "Enable Custom Minoes" feature and your custom mino list is empty.

*   **Luka** (🔴): He's small and just wants to play! His simple 3-node matrix makes him easy and pleasant to place.
*   **Jorge** (🈂️): He WILL MAKE YOU PAY! Jorge is a complex piece made out of the Japanese tax emoji – Good luck dealing with him!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
