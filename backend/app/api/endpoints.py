from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app import schemas, models
from app.database import get_db
from app.ml.predict import predict_autism

router = APIRouter()

# TABC Questions definition
SECTIONS = {
    "I. Social Interaction": [
        {"id": "q1", "text": "Inability to establish and/or maintain eye contact"},
        {"id": "q2", "text": "Child does not respond when called, sometimes appears to be deaf"},
        {"id": "q3", "text": "Difficulty in mixing and playing with other children of same age"},
        {"id": "q4", "text": "Lack of appropriate emotional responses"},
        {"id": "q5", "text": "Can do certain tasks well, but not tasks involving social understanding"},
    ],
    "II. Communication": [
        {"id": "q6", "text": "Difficulty in comprehension or communication"},
        {"id": "q7", "text": "May or may not indicate needs by gestures or leading adults by the hand"},
        {"id": "q8", "text": "Echolalia or use of nonsensical words and muttering to self"},
        {"id": "q9", "text": "Lack of pretend play"},
    ],
    "III. Behavioural Characteristics": [
        {"id": "q10", "text": "Likes sameness in everyday routine"},
        {"id": "q11", "text": "Inappropriate attachment to objects"},
        {"id": "q12", "text": "Unusual body movements such as flapping hands, rocking or jumping"},
        {"id": "q13", "text": "Extreme restlessness or prefers to remain alone"},
        {"id": "q14", "text": "Not responsive to normal teaching methods"},
    ],
    "IV. Sensory Integration": [
        {"id": "q15", "text": "Does not like to be hugged or touched or appears insensitive to pain"},
        {"id": "q16", "text": "Intolerance or addiction to certain sounds, tastes, odours or visuals"},
        {"id": "q17", "text": "No understanding or fear of real dangers or excessive fear of heights"},
        {"id": "q18", "text": "Enjoys spinning or rotating objects"},
        {"id": "q19", "text": "Inappropriate laughing or crying spells without clear reason"},
        {"id": "q20", "text": "Difficulty in fine motor skills or clumsiness"},
    ]
}

def get_interpretation(score: int) -> str:
    if 20 <= score <= 35:
        return "Non Autistic"
    elif 36 <= score <= 43:
        return "Mildly–Moderately Autistic"
    elif score >= 44:
        return "Severely Autistic"
    else:
        return "Invalid score range"

@router.get("/questions")
def get_questions():
    return SECTIONS

@router.post("/calculate", response_model=schemas.ScoreResponse)
def calculate_score(request: schemas.CalculateScoreRequest):
    total_score = sum(response.score for response in request.responses)
    interpretation = get_interpretation(total_score)
    
    # Run through ML model
    raw_scores = [resp.score for resp in request.responses]
    # In a real app we'd map questions exactly, here we just pass the 20 scores array
    # If the user answered exactly 20 questions
    ml_prediction = predict_autism(raw_scores) if len(raw_scores) == 20 else "Incomplete Data"
    
    return schemas.ScoreResponse(total_score=total_score, interpretation=interpretation, ml_prediction=ml_prediction)

@router.post("/assessment", response_model=schemas.AssessmentResult)
async def submit_assessment(assessment_in: schemas.AssessmentCreate, db: AsyncSession = Depends(get_db)):
    total_score = sum(response.score for response in assessment_in.responses)
    interpretation = get_interpretation(total_score)
    
    raw_scores = [resp.score for resp in assessment_in.responses]
    ml_prediction = predict_autism(raw_scores) if len(raw_scores) == 20 else "Incomplete Data"
    
    db_assessment = models.Assessment(
        total_score=total_score,
        interpretation=interpretation,
        child_name=assessment_in.child_name,
        child_age=assessment_in.child_age,
        child_gender=assessment_in.child_gender,
        parent_name=assessment_in.parent_name,
        contact_number=assessment_in.contact_number,
        contact_email=assessment_in.contact_email,
        consent_given=1 if assessment_in.consent_given else 0
    )
    db.add(db_assessment)
    await db.commit()
    await db.refresh(db_assessment)
    
    for response in assessment_in.responses:
        db_response = models.PatientResponse(
            assessment_id=db_assessment.id,
            question_id=response.question_id,
            section=response.section,
            score=response.score
        )
        db.add(db_response)
        
    await db.commit()
    await db.refresh(db_assessment)
    
    # We dynamically attach the ml_prediction to the response model despite it not being on the DB schema
    db_assessment.ml_prediction = ml_prediction
    return db_assessment

@router.get("/assessment/{assessment_id}", response_model=schemas.AssessmentResult)
async def get_assessment(assessment_id: int, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    
    query = select(models.Assessment).options(selectinload(models.Assessment.responses)).where(models.Assessment.id == assessment_id)
    result = await db.execute(query)
    db_assessment = result.scalar_one_or_none()
    
    if db_assessment is None:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    raw_scores = [resp.score for resp in db_assessment.responses]
    ml_prediction = predict_autism(raw_scores) if len(raw_scores) == 20 else "Incomplete Data"
    db_assessment.ml_prediction = ml_prediction
    
    return db_assessment
