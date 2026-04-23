"""
KnowledgeBase Service — Strategy Pattern Implementation with Runtime Toggle.

Architecture:
  KBProvider (ABC)
    ├── MockKBProvider   — keyword-matching against local KB_ARTICLES (DEFAULT)
    └── LLMKBProvider    — Azure OpenAI-powered resolution

Runtime toggle:
    KnowledgeBaseService.toggle_provider("llm")   # switches to Azure OpenAI
    KnowledgeBaseService.toggle_provider("mock")   # switches back to keyword match
"""
import os
from abc import ABC, abstractmethod
from app.data.kb_data import KB_ARTICLES
from dotenv import load_dotenv

load_dotenv()


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
# LLM KB Provider — Azure OpenAI
# ─────────────────────────────────────────────
class LLMKBProvider(KBProvider):
    """
    Uses Azure OpenAI to generate IT support resolutions.
    Reads credentials from environment variables.
    """
    def __init__(self):
        from openai import AzureOpenAI

        self.client = AzureOpenAI(
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT", "").strip().strip('"').strip("'"),
            api_key=os.getenv("AZURE_OPENAI_API_KEY", "").strip().strip('"').strip("'"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-12-01-preview").strip().strip('"').strip("'"),
            timeout=60.0,
            max_retries=2
        )
        self.deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT", "").strip().strip('"').strip("'")
        print(f"[KBService] LLMKBProvider initialized → {self.deployment_name}")

    def search(self, query: str) -> str | None:
        try:
            # Build context from KB articles so the LLM is grounded
            kb_context = "\n".join([
                f"- [{a['category']}] {', '.join(a['keywords'])}: {a['resolution_steps']}"
                for a in KB_ARTICLES
            ])

            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a strict, highly technical IT support AI for a corporate environment. "
                            "Do NOT be friendly, chatty, or conversational. Do not use pleasantries like 'Hello', 'I hope you are doing well', or 'Sure, I can help'. "
                            "Provide direct, factual, and strictly technical step-by-step resolution instructions. "
                            "Use the following knowledge base articles as reference. You may draw on general IT knowledge only if it directly solves the problem. "
                            "If the query is outside of IT support or inappropriate, refuse to answer and state that you are an IT support bot.\n\n"
                            f"Knowledge Base:\n{kb_context}\n\n"
                            "Ensure your response is purely technical. If you cannot resolve the issue, simply state: 'I cannot resolve this issue. Please escalate to a human technician.'"
                        ),
                    },
                    {"role": "user", "content": query},
                ],
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"[KBService] Azure OpenAI Error: {e}")
            # Fallback to keyword search on LLM failure
            mock = MockKBProvider()
            return mock.search(query)


# ─────────────────────────────────────────────
# KnowledgeBase Service — delegates to active provider
# ─────────────────────────────────────────────
class KnowledgeBaseService:
    """
    Facade that BotService calls. It delegates to whichever KBProvider is active.
    Switch providers by calling KnowledgeBaseService.toggle_provider("llm") or ("mock").
    """
    _provider: KBProvider = MockKBProvider()  # Default: keyword-matching KB
    _mode: str = "mock"  # Track current mode

    @classmethod
    def set_provider(cls, provider: KBProvider) -> None:
        """Hot-swap the provider at runtime. Takes 1 line to switch to LLM."""
        cls._provider = provider
        cls._mode = "llm" if isinstance(provider, LLMKBProvider) else "mock"
        print(f"[KnowledgeBaseService] Provider switched to: {type(provider).__name__}")

    @classmethod
    def toggle_provider(cls, mode: str) -> str:
        """
        Toggle between 'mock' and 'llm' mode.
        Returns the new active mode string.
        """
        if mode == "llm" and cls._mode != "llm":
            try:
                cls.set_provider(LLMKBProvider())
            except Exception as e:
                print(f"[KnowledgeBaseService] Failed to switch to LLM: {e}")
                return cls._mode
        elif mode == "mock" and cls._mode != "mock":
            cls.set_provider(MockKBProvider())

        return cls._mode

    @classmethod
    def get_current_mode(cls) -> str:
        """Returns 'mock' or 'llm'."""
        return cls._mode

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