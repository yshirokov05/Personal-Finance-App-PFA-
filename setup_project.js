  const { execSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');

  // Helper function to run commands with output
  function runCommand(command, description) {
    console.log(`\n🔧 ${description}...`);
    try {
      execSync(command, { stdio: 'inherit', cwd: __dirname });
      console.log(`✅ ${description} - Done`);
    } catch (error) {
      console.error(`❌ ${description} - Failed`);
      throw error;
    }
  }

  console.log('🚀 Starting Personal Finance App Setup...\n');

  // Step 1: Create README.md with project goals
  console.log('📝 Creating README.md...');
  const readmeContent = `# Personal Finance App (PFA)

  ## 🎯 Project Overview
  A web-based personal finance application designed for tracking variable income and manual asset    
  growth.

  ## 👤 Solo Project
  This is a solo development project focused on building a practical financial management tool.      

  ## 💰 Core Features

  ### Variable Income Tracking
  - **Hourly/Paycheck Income**: Track irregular income streams from hourly work or variable paychecks
  - **Income History**: View and analyze income patterns over time
  - **Income Forecasting**: Estimate future earnings based on historical data

  ### Manual Asset Management
  - **IRA Tracking**: Monitor Individual Retirement Account balances and contributions
  - **Stock Portfolio**: Track stock holdings and performance
  - **Savings Accounts**: Manage multiple savings accounts and goals

  ### Asset Growth Monitoring
  - Calculate net worth across all asset types
  - Visualize asset growth over time
  - Set and track financial goals

  ## 🛠️ Tech Stack
  - **Frontend**: React
  - **Backend**: Firebase (Authentication, Firestore Database, Hosting)
  - **State Management**: React Context API / Redux (TBD)
  - **UI Framework**: Material-UI / Tailwind CSS (TBD)

  ##  Project Status
  - [x] Project initialization
  - [ ] Firebase configuration
  - [ ] Authentication setup
  - [ ] Database schema design
  - [ ] Income tracking UI
  - [ ] Asset management UI
  - [ ] Dashboard with analytics

  ## 🚀 Getting Started

  ### Prerequisites
  - Node.js (v14 or higher)
  - npm or yarn
  - Firebase account

  ### Installation
  \`\`\`bash
  npm install
  \`\`\`

  ### Development
  \`\`\`bash
  npm start
  \`\`\`

  ### Build
  \`\`\`bash
  npm run build
  \`\`\`

  ## 📦 Firebase Setup
  1. Create a Firebase project at https://console.firebase.google.com
  2. Enable Authentication (Email/Password)
  3. Create a Firestore database
  4. Add your Firebase config to \`.env\` file

  ## 🗂️ Project Structure
  \`\`\`
  /src
    /components    # Reusable UI components
    /pages        # Main application pages
    /services     # Firebase and API services
    /context      # React Context providers
    /utils        # Helper functions
  \`\`\`

  ## 📝 License
  Personal project - All rights reserved

  ## 🤖 Development Notes
  Initial setup completed with Claude Code automation.
  `;

  fs.writeFileSync(path.join(__dirname, 'README.md'), readmeContent);
  console.log('✅ README.md created successfully');

  // Step 2: Initialize React app if package.json doesn't exist
  if (!fs.existsSync(path.join(__dirname, 'package.json'))) {
    console.log('\n📦 Initializing React application...');
    console.log('This may take a few minutes...\n');
    runCommand('npx create-react-app . --use-npm', 'Create React App setup');
  } else {
    console.log('\n✅ React app already initialized (package.json found)');
  }

  // Step 3: Install Firebase
  console.log('\n Installing Firebase...');
  runCommand('npm install firebase', 'Firebase installation');

  // Step 4: Create Firebase config file structure
  console.log('\n📁 Creating Firebase config structure...');
  const firebaseConfigDir = path.join(__dirname, 'src', 'firebase');
  if (!fs.existsSync(firebaseConfigDir)) {
    fs.mkdirSync(firebaseConfigDir, { recursive: true });
  }

  const firebaseConfigContent = `// Firebase configuration
  // Replace these values with your Firebase project settings
  // Get them from: Firebase Console > Project Settings > Your Apps

  import { initializeApp } from 'firebase/app';
  import { getAuth } from 'firebase/auth';
  import { getFirestore } from 'firebase/firestore';

  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize Firebase services
  export const auth = getAuth(app);
  export const db = getFirestore(app);

  export default app;
  `;

  fs.writeFileSync(path.join(firebaseConfigDir, 'config.js'), firebaseConfigContent);
  console.log('✅ Firebase config template created at src/firebase/config.js');

  // Step 5: Create .env.example file
  const envExampleContent = `# Firebase Configuration
  # Copy this file to .env and fill in your Firebase project details
  REACT_APP_FIREBASE_API_KEY=your_api_key_here
  REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
  REACT_APP_FIREBASE_PROJECT_ID=your_project_id_here
  REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
  REACT_APP_FIREBASE_APP_ID=your_app_id_here
  `;

  fs.writeFileSync(path.join(__dirname, '.env.example'), envExampleContent);
  console.log('✅ .env.example created');

  // Step 6: Update .gitignore to include .env
  const gitignorePath = path.join(__dirname, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignoreContent.includes('.env')) {
      gitignoreContent += '\n# Environment variables\n.env\n.env.local\n';
      fs.writeFileSync(gitignorePath, gitignoreContent);
      console.log('✅ Updated .gitignore to include .env files');
    }
  }

  // Step 7: Git commands
  console.log('\n📦 Running Git commands...');
  runCommand('git add .', 'Git add all files');
  runCommand('git commit -m "Initial solo setup: React + Firebase structure"', 'Git commit');        

  // Check if remote exists before pushing
  try {
    execSync('git remote get-url origin', { stdio: 'pipe', cwd: __dirname });
    console.log('\n🚀 Pushing to remote repository...');
    runCommand('git push', 'Git push');
  } catch (error) {
    console.log('\n⚠️  No remote repository configured. Skipping git push.');
    console.log('To add a remote and push:');
    console.log('  git remote add origin <your-repo-url>');
    console.log('  git push -u origin main');
  }

  console.log('\n\n🎉 Setup Complete! 🎉');
  console.log('\n📋 Next Steps:');
  console.log('1. Create a Firebase project at https://console.firebase.google.com');
  console.log('2. Copy .env.example to .env and add your Firebase credentials');
  console.log('3. Run "npm start" to start the development server');
  console.log('\n💡 Happy coding!\n');