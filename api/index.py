"""
Vercel Serverless Entry Point for the FastAPI backend.

Vercel's @vercel/python runtime expects a WSGI/ASGI app exported as `app`
from the file matched in vercel.json builds.src.

This file re-exports the FastAPI app so Vercel can serve it as a
serverless function while local development continues to use run.py + uvicorn.

Usage:
  - Local dev: python backend/run.py
  - Vercel:    Automatically invoked via vercel.json routing
"""
import sys
import os

# Ensure the backend package is importable when running from project root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app.main import app  # noqa: F401 — Vercel needs this exported name

# Vercel expects the ASGI app to be importable as `app` from this module.
# The import above satisfies that requirement.
