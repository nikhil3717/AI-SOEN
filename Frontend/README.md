# React + Vite

## Project Structure

The project is organized as follows:

```
/d:/Functional Web Development/AI-SOEN/Frontend/
├── public/                 # Static assets
├── src/                    # Source files
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── pages/              # Page components
│   ├── services/           # API calls and services
│   ├── styles/             # CSS and styling
│   ├── App.jsx             # Main App component
│   ├── main.jsx            # Entry point
│   └── index.html          # HTML template
├── .eslintrc.js            # ESLint configuration
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies and scripts
├── README.md               # Project documentation
└── vite.config.js          # Vite configuration
```

## About the Project

This web application is a chat platform with AI code generation capabilities. It allows users to interact with an AI to generate code snippets and provides a real-time chat interface.

## Getting Started

To get started with the project, follow these steps:

1. **Install dependencies**:
  ```sh
  npm install
  ```

2. **Run the development server**:
  ```sh
  npm run dev
  ```

3. **Build for production**:
  ```sh
  npm run build
  ```

4. **Preview the production build**:
  ```sh
  npm run preview
  ```

## Features

- Real-time chat interface
- AI-powered code generation
- Fast Refresh with Vite
- ESLint for code quality

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License
This project is licensed under the MIT License.

## Frontend Files

### `App.jsx`

This is the main component of the React application. It sets up the routes and renders the main layout.

```jsx
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/chat" component={ChatPage} />
      </Switch>
    </Router>
  );
}

export default App;
```

### `main.jsx`

This is the entry point of the React application. It renders the `App` component into the root element.

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/index.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

## Backend Files

### `server.js`

This is the main server file for the backend. It sets up the Express server and defines the API endpoints.

```js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { generateCode } = require('./services/aiService');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/generate-code', async (req, res) => {
  const { prompt } = req.body;
  try {
    const code = await generateCode(prompt);
    res.json({ code });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate code' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

### `services/aiService.js`

This file contains the logic for interacting with the AI to generate code.

```js
const axios = require('axios');

async function generateCode(prompt) {
  const response = await axios.post('https://api.example.com/generate-code', { prompt });
  return response.data.code;
}

module.exports = { generateCode };
```


This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
