# Handdown Frontend 📱

Handdown is a marketplace app for college students to buy and sell items within their campus community. This is the frontend mobile application built with React Native and Expo.

## What You Need Before Starting

Before you can run this app, make sure you have these installed on your computer:

- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A **web browser** (Chrome, Safari, Firefox, etc.)
- **Terminal/Command Prompt** access

## Quick Setup Guide

### Step 1: Install Dependencies

First, open your terminal and navigate to this project folder, then install all the required packages:

```bash
npm install
```

*This downloads all the code libraries the app needs to work.*

### Step 2: Set Up API Connection

The app needs to connect to a backend server to get listing data. You need to create a configuration file:

1. **Create a file** called `.env` in this project folder (same level as this README)

2. **Find your computer's IP address:**
   - **On Mac/Linux:** Open Terminal and type `ifconfig`, then look for `en0` and copy the IP address
   - **On Windows:** Open Command Prompt and type `ipconfig`, then look for your local IP address

3. **Add this line to your `.env` file:**
   ```
   EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP_ADDRESS:8000
   ```
   
   Replace `YOUR_IP_ADDRESS` with the IP you found. For example:
   ```
   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8000
   ```

*This tells the app where to find the backend server that has all the listing data.*

### Step 3: Start the App

Make sure your backend API server is running first, then start the frontend:

```bash
npm run web
```

The app will open in your web browser automatically. If it doesn't, look for a URL in your terminal (usually `http://localhost:8081`) and open it in your browser.

## What You'll See

- **Home Tab:** Browse all available listings
- **Nearby Tab:** See items near your location  
- **Moving Tab:** Items from students who are moving
- **Chats Tab:** Message other users about items
- **Create Listing:** Post your own items for sale

## Common Issues & Solutions

**Problem:** "Cannot connect to server" or listings don't load
- **Solution:** Make sure your backend API is running and your IP address in `.env` is correct

**Problem:** App won't start or shows errors
- **Solution:** Try deleting `node_modules` folder and running `npm install` again

**Problem:** Images don't display
- **Solution:** Check that your backend server is serving images correctly

