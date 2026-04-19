## NOTE: This changes are already in place and commented! We just need to uncomment them and start using Azure OpenAI!

Because we already successfully prepared the architecture with the **Strategy Pattern** in an earlier step, replacing the mock KB with an Azure OpenAI integration will take exactly 30 seconds.

Here are the specific, step-by-step instructions to perform the swap:

### Step 1: Install the OpenAI Python package
In your terminal, activate your virtual environment and install the required library:
```bash
cd backend
source venv/bin/activate
pip install openai python-dotenv
```

### Step 2: Update your `.env` file
Add the provided Azure credentials securely to `backend/.env`:
```text
AZURE_OPENAI_ENDPOINT="xxxxxxx"
AZURE_OPENAI_API_KEY="xxxxxx"
AZURE_OPENAI_DEPLOYMENT="xxxxx"
AZURE_OPENAI_API_VERSION="xxxxxx"
```

### Step 3: Flesh out the placeholder `LLMKBProvider`
Open `backend/app/services/kb_service.py` and replace the existing `LLMKBProvider` dummy class (around line 46) with the actual Azure OpenAI implementation:

```python
import os
from openai import AzureOpenAI
from dotenv import load_dotenv

load_dotenv()  # load credentials from .env

class LLMKBProvider(KBProvider):
    def __init__(self):
        self.client = AzureOpenAI(
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION")
        )
        self.deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT")

    def search(self, query: str) -> str | None:
        try:
            # We enforce JSON output returning the resolution
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {"role": "system", "content": "You are a helpful IT support expert. Analyze the user's issue and provide concise resolution steps."},
                    {"role": "user", "content": query}
                ],
                max_tokens=250,
                temperature=0.3
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Azure OpenAI Error: {e}")
            return None
```

### Step 4: Perform the "30-Second Swap" 🪄
Now, open `backend/app/main.py`. Somewhere near the top of the file (after imports but before API endpoints), add these two lines to instruct the system to use the LLM instead of the Keyword mock:

```python
from app.services.kb_service import KnowledgeBaseService, LLMKBProvider

# Swap the provider at bootup
KnowledgeBaseService.set_provider(LLMKBProvider())
```

### What happens next?
* You don't need to touch `bot_service.py` or any UI component.
* The chatbot will now pass user queries to your new `LLMKBProvider.search()` method instead of the mock DB.
* The system orchestrates the rest, reading the LLM's resolution and generating the chatbot interface response.