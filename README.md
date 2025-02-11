# Dialogue Room

**Dialogue Room** is a real-time chat application built using the MERN stack (MongoDB, Express, React, Node.js). The app allows users to connect and chat with each other in real-time using **socket.io**. This project is designed to be simple yet powerful for building scalable and interactive chat applications.

## Tech Stack

- **Client**: React, Next.js, Redux, Tailwind CSS
- **Server**: Node.js, Express, Socket.io
- **Database**: MongoDB

## Features

- Real-time chat with socket.io
- User authentication with JWT
- Responsive UI with Tailwind CSS
- Redux for state management
- Email notifications for new messages

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 20.18.0 or later)
- **MongoDB** (running locally or using a cloud service like MongoDB Atlas)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/AfaqShahidKhan/dialogue-room.git
cd dialogue-room
npm install
cd server
npm install
cd ..
cd client
npm install
cd ..
npm run dev

```

### 2. How to Contribute

- Create a new branch for your changes
  Before making any changes, it’s important to create a new branch. This keeps your changes isolated from the main branch, and makes it easier for the maintainers to review your code.

To create a new branch, use this naming convention: username-001-feature-branch. For example, if your username is johndoe and you're working on a feature, your branch would look like this:

```bash
git checkout -b johndoe-001-feature-branch
```

- Make Your Changes
  Now, you can make the changes you want in the codebase. Whether it’s fixing bugs, improving documentation, or adding features, you can edit the files as needed.

- Commit Your Changes
  After making your changes, it’s time to commit them. Use descriptive commit messages so others know what your changes are about:

```bash
git commit -m "Fix bug in feature X"
```

- Push Your Changes
  Once you’ve committed your changes, push them back to your forked repository:

```bash
git push origin johndoe-001-feature-branch
```

- Create a Pull Request
  Finally, go back to the original repository on GitHub and click on the Pull Request button to submit your changes. Be sure to explain what you changed and why in the description.

After submitting, the repository maintainers will review your pull request. They may ask for changes, or they might merge your pull request into the main repository.
