# Roadmap: Building Q-Tendies (0 to 1)

This document outlines the foundational steps to move from concept to a working "Agentic Quantum Finance" MVP. The focus is on creating a modular, quantum-aware harness.

## Phase 1: Environment & Foundation (0 -> 0.3)
1.  **Dependency Initialization**:
    *   Install `qiskit`, `qiskit-optimization`, `pennylane`, and `pandas`.
    *   Setup a `SimulatorConfig` class to switch between local state-vector simulators and noisy IBMQ/IonQ backends.
2.  **The Classical Bridge**:
    *   Create a module to fetch real-market data (Yahoo Finance/Alpaca).
    *   Implement a "Risk-Return" normalizer to prepare data for Quantum State Preparation.

## Phase 2: The Core Quantum Skills (0.3 -> 0.7)
1.  **Module: `QuantumOptimizer`**:
    *   Implement a basic QAOA (Quantum Approximate Optimization Algorithm) for Portfolio selection.
    *   *Requirement*: Must take a Covariance Matrix and return a binary bitstring representing the "Optimal Portfolio".
2.  **Module: `AmplitudeEstimator`**:
    *   Implement a basic QAE (Quantum Amplitude Estimation) for Option Pricing.
    *   *Requirement*: Must handle Bernoulli trials to estimate price probabilities with quadratic speedup.
3.  **Module: `QuantumBacktester` (Boomer Mode)**:
    *   **The "3x" Rule**: Create a simulator-based backtester that compares the "Quantum-Picked" portfolio against classical benchmarks across **3 distinct market regimes** (e.g., Bear Market 2022, Bull Market 2021, and Neutral 2023).
    *   *Requirement*: The strategy must pass all 3 windows to be "Boomer Approved".

## Phase 3: The Agentic Harness (0.7 -> 1.0)
1.  **Module: `HarnessOrchestrator`**:
    *   This is the "Brain". It decides *which* quantum algorithm to run based on the user's prompt (e.g., "I want to hedge my tech stocks" -> Selects Optimizer).
    *   **Self-Correction**: If the quantum circuit fails (depth too high for current hardware), the agent must automatically "transpile" or simplify the circuit.
2.  **MVP Demo**:
    *   A single script that takes 5 stock tickers, runs a Quantum Portfolio Optimization, and outputs a "Quantum-Optimized Weighting" report.

---

# Module Definitions & Responsibility

| Module | Responsibility | Why it matters |
| :--- | :--- | :--- |
| `DataBridge` | Classical -> Quantum translation. | Quantum computers don't understand "USD". They understand "Amplitudes". |
| `QuantumKernel` | Executing circuits on Qiskit/PennyLane. | This is the "Engine". It must be hardware-agnostic. |
| `AgentHarness` | Policy & Decision making. | Decides shot counts, noise mitigation strategies, and result interpretation. |
| `MissionReviewer` | Verification of results. | Checks if the quantum output is actually better than a classical baseline (Liar Check). |
