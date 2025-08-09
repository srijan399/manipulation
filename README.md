# Reddit Knowledge Archivist
Turn Reddit threads into a neatly organized Notion knowledge base.

## 🚀 Overview
Reddit is a goldmine of discussions, but it’s hard to sift through noise and keep track of valuable insights.
Reddit Knowledge Archivist automates this process: you give it a topic, and it fetches the most relevant posts & comments, distills key points, categorizes them, and stores everything neatly in a Notion database.

## ⚙️ How It Works
User Input → Enter a topic and timeframe in the Next.js frontend.

Orchestrator Agent → Finds relevant subreddits to search.

Scraper Agent → Pulls top posts & comments using the Reddit API.

Summarizer Agent → Uses an LLM to extract insights and group them into categories.

Notion Updater Agent → Creates or updates a Notion knowledge base with summaries and source links.

## 🛠 Tech Stack
Frontend: Next.js + Tailwind CSS

Agents & Orchestration: LangGraph / AutoGen style agent flows

APIs: Reddit API, Notion API

LLM Processing: OpenAI or Anthropic models

## 🎯 Features
Automated Reddit data extraction

Smart summarization & categorization

Notion knowledge base integration

Configurable subreddits & keywords

## 📚 Use Cases
Tracking industry-specific discussions

Building research libraries

Keeping up with niche communities without scrolling

## 🧠 Learning Goals for Developers
Multi-agent orchestration

API integration (Reddit, Notion)

LLM-based text processing

Frontend-backend coordination in Next.js
