import pytest
from app.api.endpoints import get_interpretation, calculate_score
from app.schemas import CalculateScoreRequest, QuestionResponse

def test_get_interpretation():
    assert get_interpretation(20) == "Non Autistic"
    assert get_interpretation(35) == "Non Autistic"
    assert get_interpretation(36) == "Mildly–Moderately Autistic"
    assert get_interpretation(43) == "Mildly–Moderately Autistic"
    assert get_interpretation(44) == "Severely Autistic"
    assert get_interpretation(80) == "Severely Autistic"

def test_calculate_score():
    req = CalculateScoreRequest(responses=[
        QuestionResponse(question_id="q1", section="1", score=4),
        QuestionResponse(question_id="q2", section="1", score=4),
        QuestionResponse(question_id="q3", section="1", score=4),
        QuestionResponse(question_id="q4", section="1", score=4),
        QuestionResponse(question_id="q5", section="1", score=4),
    ])
    res = calculate_score(req)
    assert res.total_score == 20
    assert res.interpretation == "Non Autistic"
