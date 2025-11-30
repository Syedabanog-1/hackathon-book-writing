

https://github.com/user-attachments/assets/fd255762-344f-48d8-a8c3-61405ccf1d5b


# Physical AI & Humanoid Robotics Textbook

This project contains the source code for the Physical AI & Humanoid Robotics Textbook.

## Structure

-   `docusaurus-app/`: The frontend website built with Docusaurus.
-   `backend-api/`: The FastAPI backend for RAG and personalization.
-   `subagents/`: AI subagents for content generation.

## Setup

1.  **Frontend**:
    ```bash
    cd docusaurus-app
    npm start
    ```

2.  **Backend**:
    ```bash
    cd backend-api
    pip install -r requirements.txt
    cp .env.example .env
    # Edit .env with your credentials
    uvicorn main:app --reload
    ```

3.  **Subagents**:
    ```bash
    cd subagents
    pip install -r requirements.txt
    ```
