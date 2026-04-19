"""
KnowledgeBase Service — Strategy Pattern Implementation.

Architecture:
  KBProvider (ABC)
    ├── MockKBProvider   — keyword-matching against local KB_ARTICLES (DEFAULT)
    └── LLMKBProvider    — simulated LLM API call (ready to replace with real LLM)

To swap providers at runtime (the 30-second demo swap):
    from app.services.kb_service import KnowledgeBaseService, LLMKBProvider
    KnowledgeBaseService.set_provider(LLMKBProvider())
"""
from abc import ABC, abstractmethod
from app.data.kb_data import KB_ARTICLES


# ─────────────────────────────────────────────
# Abstract Provider Interface
# ─────────────────────────────────────────────
class KBProvider(ABC):
    @abstractmethod
    def search(self, query: str) -> str | None:
        """Search for a resolution based on the user's query."""
        pass


# ─────────────────────────────────────────────
# Mock KB Provider — Keyword Matching
# ─────────────────────────────────────────────
class MockKBProvider(KBProvider):
    """
    Searches KB_ARTICLES using keyword matching.
    Data source: app/data/kb_data.py (separated from mock_db).
    """
    def search(self, query: str) -> str | None:
        lower_query = query.lower()
        for article in KB_ARTICLES:
            if any(kw in lower_query for kw in article["keywords"]):
                return article["resolution_steps"]
        return None


# ─────────────────────────────────────────────
# LLM KB Provider — Simulated External API Call
# ─────────────────────────────────────────────
class LLMKBProvider(KBProvider):
    """
    30-SECOND SWAP: Replace MockKBProvider with this to use an LLM.

    To activate Azure OpenAI:
    1. pip install openai python-dotenv
    2. Add Azure keys to backend/.env
    3. Uncomment the code below.
    """
    # ====== UNCOMMENT TO USE AZURE OPENAI ======
    # def __init__(self):
    #     import os
    #     from openai import AzureOpenAI
    #     from dotenv import load_dotenv
    #     load_dotenv()
        
    #     self.client = AzureOpenAI(
    #         azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    #         api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    #         api_version=os.getenv("AZURE_OPENAI_API_VERSION")
    #     )
    #     self.deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT")
    
    # def search(self, query: str) -> str | None:
    #     try:
    #         response = self.client.chat.completions.create(
    #             model=self.deployment_name,
    #             messages=[
    #                 {"role": "system", "content": "You are a helpful IT support expert. Analyze the user's issue and provide concise resolution steps."},
    #                 {"role": "user", "content": query}
    #             ],
    #         )
    #         return response.choices[0].message.content
    #     except Exception as e:
    #         print(f"Azure OpenAI Error: {e}")
    #         return None
    # ============================================


# ─────────────────────────────────────────────
# KnowledgeBase Service — delegates to active provider
# ─────────────────────────────────────────────
class KnowledgeBaseService:
    """
    Facade that BotService calls. It delegates to whichever KBProvider is active.
    Switch providers by calling KnowledgeBaseService.set_provider(new_provider).
    """
    _provider: KBProvider = MockKBProvider()  # Default: keyword-matching KB

    @classmethod
    def set_provider(cls, provider: KBProvider) -> None:
        """Hot-swap the provider at runtime. Takes 1 line to switch to LLM."""
        cls._provider = provider
        print(f"[KnowledgeBaseService] Provider switched to: {type(provider).__name__}")

    @classmethod
    def get_provider_name(cls) -> str:
        """Returns the name of the currently active provider."""
        return type(cls._provider).__name__

    @staticmethod
    def search(query: str) -> str | None:
        """
        Primary search method called by BotService.
        Delegates to the active KBProvider.
        """
        return KnowledgeBaseService._provider.search(query)