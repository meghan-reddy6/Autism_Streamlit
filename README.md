# Thundersoft Autism Behavioural Checklist (TABC) Score Calculator

## Description

This is a Streamlit web application that implements the Thundersoft Autism Behavioural Checklist (TABC) for calculating autism scores based on behavioral observations. The tool assesses children across four main categories: Social Interaction, Communication, Behavioural Characteristics, and Sensory Integration.

## Features

- Interactive questionnaire with 20 questions organized into four behavioral categories
- Sidebar with clear instructions and scoring guide for easy reference
- Horizontal radio buttons for improved user experience
- Real-time score calculation with metric display
- Assessment categories: Non Autistic, Mildly–Moderately Autistic, Severely Autistic
- Responsive layout with centered elements and containers
- Educational screening tool with professional disclaimer

## Installation

1. Clone or download the repository.
2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

## Usage

Run the Streamlit app:

```bash
streamlit run autism.py
```

Open the provided URL in your web browser. The sidebar contains instructions and scoring guidelines. Answer all 20 questions by selecting the appropriate frequency for each behavior, then click the **Calculate Score** button to view the assessment result.

## Scoring

- Never = 1
- Sometimes = 2
- Often = 3
- Always = 4

Total scores:

- 20-35: Non Autistic
- 36-43: Mildly–Moderately Autistic
- 44+: Severely Autistic

## Disclaimer

⚠️ This tool is for educational screening purposes only and not a diagnostic instrument. Please consult a qualified clinician for professional evaluation.

## Requirements

- Python 3.x
- Streamlit 1.31.1
