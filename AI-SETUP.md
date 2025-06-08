# AI Feature Setup Guide

This guide will help you set up the AI features in the expense tracker application.

## Debugging the AI Savings Feature

If you're having issues with the AI Savings feature, follow these steps:

### 1. Check your API Key Configuration

The application uses Google's Gemini AI model, which requires a valid API key.

1. Create a Google AI API key from the Google AI Studio website (https://makersuite.google.com/app/apikey)
2. Create a `.env` file in the root of your project with the following:

```
# Google AI Configuration
GOOGLE_API_KEY=your_google_ai_api_key_here
```

3. Run the test script to verify your API key configuration:

```bash
npm run test:ai-config
```

### 2. Start the Genkit Development Server

1. In a separate terminal, run:

```bash
npm run genkit:dev
```

2. If you see errors related to API key configuration or permissions, double-check your API key.

### 3. Check API Access and Permissions

1. Make sure your Google account and API key have access to the Gemini models
2. Some regions may have restrictions on AI model access
3. Check if you have reached your quota limit for the Google AI API

### 4. Error Handling and Fallback Mechanism

The application now includes:

- Improved error logging to help diagnose issues
- A fallback mechanism that provides generic savings tips when the AI service is unavailable
- An error details card that displays specific error information in development mode

### 5. Common Issues

- **Authentication Errors**: Make sure your API key is correctly formatted and has not expired
- **Permission Issues**: Ensure your API key has proper permissions to access the Gemini model
- **Network Connectivity**: Check your internet connection
- **Rate Limiting**: You might have exceeded your API usage quota

## Running the Application

After setting up your environment variables, restart your development server:

```bash
npm run dev
```

Now, try using the AI Savings feature. If it's correctly configured, you'll see personalized saving tips based on your spending habits. If the AI service is unavailable, the application will fall back to providing generic saving tips. 