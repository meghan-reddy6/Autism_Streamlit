from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
import subprocess
import os
import logging

from app import schemas, models
from app.database import get_db
from app.ml.predict import ml_service

logger = logging.getLogger(__name__)
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

@router.get("/questions")
def get_questions():
    """Retrieve all TABC questions for the frontend assessment form."""
    return SECTIONS

@router.post("/calculate", response_model=schemas.ScoreResponse)
def calculate_score(request: schemas.CalculateScoreRequest):
    """Stateless evaluation of an assessment, returning scores without saving to DB."""
    total_score = sum(response.score for response in request.responses)
    interpretation = ml_service.get_rule_based_interpretation(total_score)
    
    raw_scores = [resp.score for resp in request.responses]
    ml_prediction = ml_service.predict_autism(raw_scores) if len(raw_scores) == 20 else "Incomplete Data"
    
    return schemas.ScoreResponse(
        total_score=total_score, 
        interpretation=interpretation, 
        ml_prediction=ml_prediction
    )

@router.post("/assessment", response_model=schemas.AssessmentResult)
async def submit_assessment(assessment_in: schemas.AssessmentCreate, db: AsyncSession = Depends(get_db)):
    """Evaluate and store a completed assessment linking patient demographic data."""
    total_score = sum(response.score for response in assessment_in.responses)
    interpretation = ml_service.get_rule_based_interpretation(total_score)
    
    raw_scores = [resp.score for resp in assessment_in.responses]
    ml_prediction = ml_service.predict_autism(raw_scores) if len(raw_scores) == 20 else "Incomplete Data"
    
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
    
    try:
        db.add(db_assessment)
        await db.flush()  # Get assessment ID before bulk insert
        
        responses_to_db = [
            models.PatientResponse(
                assessment_id=db_assessment.id,
                question_id=response.question_id,
                section=response.section,
                score=response.score
            )
            for response in assessment_in.responses
        ]
        
        db.add_all(responses_to_db)
        await db.commit()
        await db.refresh(db_assessment)
        
    except SQLAlchemyError as e:
        await db.rollback()
        logger.error(f"Database error during assessment creation: {e}")
        raise HTTPException(status_code=500, detail="An error occurred saving the assessment data.")
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error during assessment creation: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
        
    return schemas.AssessmentResult(
        id=db_assessment.id,
        total_score=db_assessment.total_score,
        interpretation=db_assessment.interpretation,
        ml_prediction=ml_prediction,
        child_name=db_assessment.child_name,
        child_age=db_assessment.child_age,
        child_gender=db_assessment.child_gender,
        parent_name=db_assessment.parent_name,
        contact_number=db_assessment.contact_number,
        contact_email=db_assessment.contact_email,
        consent_given=bool(db_assessment.consent_given),
        created_at=db_assessment.created_at,
        responses=None
    )

@router.get("/assessment/{assessment_id}", response_model=schemas.AssessmentResult)
async def get_assessment(assessment_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve an assessment score and clinical report by its ID."""
    try:
        query = select(models.Assessment).options(selectinload(models.Assessment.responses)).where(models.Assessment.id == assessment_id)
        result = await db.execute(query)
        db_assessment = result.scalar_one_or_none()
        
        if db_assessment is None:
            raise HTTPException(status_code=404, detail="Assessment not found")
            
        raw_scores = [resp.score for resp in db_assessment.responses]
        ml_prediction = ml_service.predict_autism(raw_scores) if len(raw_scores) == 20 else "Incomplete Data"
        
        responses = [
            schemas.QuestionResponse(
                question_id=resp.question_id,
                section=resp.section,
                score=resp.score
            ) for resp in db_assessment.responses
        ]
        
        return schemas.AssessmentResult(
            id=db_assessment.id,
            total_score=db_assessment.total_score,
            interpretation=db_assessment.interpretation,
            ml_prediction=ml_prediction,
            child_name=db_assessment.child_name,
            child_age=db_assessment.child_age,
            child_gender=db_assessment.child_gender,
            parent_name=db_assessment.parent_name,
            contact_number=db_assessment.contact_number,
            contact_email=db_assessment.contact_email,
            consent_given=bool(db_assessment.consent_given),
            created_at=db_assessment.created_at,
            responses=responses
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving assessment {assessment_id}: {e}")
        raise HTTPException(status_code=500, detail="Database lookup failed")

@router.post("/admin/retrain")
async def admin_retrain():
    """Admin endpoint to retrain the ML model by running the training script."""
    script_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "scripts", "train_model.py")
    try:
        proc = subprocess.run(["python", script_path], capture_output=True, text=True, check=False)
    except Exception as e:
        logger.error(f"Failed to start training script: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start training script: {e}")

    # Use the encapsulated service singleton
    success, msg = ml_service.reload_model()

    return {
        "training_returncode": proc.returncode,
        "training_stdout": proc.stdout,
        "training_stderr": proc.stderr,
        "model_reload_success": success,
        "model_reload_message": msg,
    }
