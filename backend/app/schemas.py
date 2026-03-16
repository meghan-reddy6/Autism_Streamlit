from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class QuestionResponse(BaseModel):
    question_id: str
    section: str
    score: int

class AssessmentCreate(BaseModel):
    # Child Demographics
    child_name: str
    child_age: str
    child_gender: str
    
    # Parent/Guardian Details
    parent_name: str
    contact_number: str
    contact_email: str
    
    # Legal
    consent_given: bool

    responses: List[QuestionResponse]

class AssessmentResult(BaseModel):
    id: int
    total_score: int
    interpretation: str
    ml_prediction: Optional[str] = None
    
    # Demographics Echo
    child_name: str
    child_age: str
    child_gender: str
    parent_name: str
    contact_number: str
    contact_email: str
    consent_given: bool
    created_at: datetime
    
    responses: Optional[List[QuestionResponse]] = None
    
    class Config:
        from_attributes = True

class CalculateScoreRequest(BaseModel):
    responses: List[QuestionResponse]

class ScoreResponse(BaseModel):
    total_score: int
    interpretation: str
    ml_prediction: Optional[str] = None
