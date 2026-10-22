@echo off
if not exist .env (
  echo Missing .env. Copy .env.example to .env and enter your MySQL password first.
  pause
  exit /b 1
)
tools\node\node.exe server.js
