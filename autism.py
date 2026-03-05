import streamlit as st

st.set_page_config(
    page_title="Autism Behavioural Checklist (TABC)",
    layout="wide"
)

# ---------------- HEADER ----------------

st.title("Thundersoft Autism Behavioural Checklist (TABC)")
st.subheader("Autism Score Calculator")

# ---------------- SIDEBAR ----------------

with st.sidebar:
    st.header("Instructions")

    st.markdown("""
    Please rate each statement based on how often the behaviour occurs.

    **Scoring Guide**

    - Never = 1  
    - Sometimes = 2  
    - Often = 3  
    - Always = 4

    Complete all questions and then click **Calculate Score**.
    """)

# ---------------- OPTIONS ----------------

options = {
    "Never": 1,
    "Sometimes": 2,
    "Often": 3,
    "Always": 4
}

total_score = 0

def ask_question(question, key):
    response = st.radio(
        question,
        options.keys(),
        horizontal=True,
        key=key
    )
    return options[response]


# ---------------- QUESTIONS ----------------

sections = {
    "I. Social Interaction": [
        "Inability to establish and/or maintain eye contact",
        "Child does not respond when called, sometimes appears to be deaf",
        "Difficulty in mixing and playing with other children of same age",
        "Lack of appropriate emotional responses",
        "Can do certain tasks well, but not tasks involving social understanding",
    ],

    "II. Communication": [
        "Difficulty in comprehension or communication",
        "May or may not indicate needs by gestures or leading adults by the hand",
        "Echolalia or use of nonsensical words and muttering to self",
        "Lack of pretend play",
    ],

    "III. Behavioural Characteristics": [
        "Likes sameness in everyday routine",
        "Inappropriate attachment to objects",
        "Unusual body movements such as flapping hands, rocking or jumping",
        "Extreme restlessness or prefers to remain alone",
        "Not responsive to normal teaching methods",
    ],

    "IV. Sensory Integration": [
        "Does not like to be hugged or touched or appears insensitive to pain",
        "Intolerance or addiction to certain sounds, tastes, odours or visuals",
        "No understanding or fear of real dangers or excessive fear of heights",
        "Enjoys spinning or rotating objects",
        "Inappropriate laughing or crying spells without clear reason",
        "Difficulty in fine motor skills or clumsiness",
    ]
}

question_number = 1

for section, questions in sections.items():

    st.markdown("---")
    st.header(section)

    with st.container():
        for q in questions:
            total_score += ask_question(
                f"{question_number}. {q}",
                f"q{question_number}"
            )
            question_number += 1

st.markdown("---")

# ---------------- CALCULATE BUTTON ----------------

col1, col2, col3 = st.columns([1,2,1])

with col2:
    calculate = st.button("Calculate Score", use_container_width=True)

# ---------------- RESULTS ----------------

if calculate:

    st.markdown("## Assessment Result")

    col1, col2, col3 = st.columns(3)

    with col2:
        st.metric("Total Score", total_score)

    st.markdown("### Interpretation")

    if 20 <= total_score <= 35:
        st.success("Non Autistic")

    elif 36 <= total_score <= 43:
        st.warning("Mildly–Moderately Autistic")

    elif total_score >= 44:
        st.error("Severely Autistic")

    else:
        st.info("Invalid score range")

    st.markdown("---")

    st.caption(
        "This tool is intended for educational screening purposes only "
        "and is not a diagnostic instrument. Please consult a qualified "
        "clinician for professional evaluation."
    )

    st.caption(
        "~A project by Meghan"
    )