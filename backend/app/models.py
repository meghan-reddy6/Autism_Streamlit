from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    total_score = Column(Integer, nullable=True)
    interpretation = Column(String, nullable=True)
    
    # Child Demographics
    child_name = Column(String, nullable=True)
    child_age = Column(String, nullable=True)
    child_gender = Column(String, nullable=True)
    
    # Parent/Guardian Details
    parent_name = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    
    # Legal
    consent_given = Column(Integer, default=0) # 0 for false, 1 for true

    responses = relationship("PatientResponse", back_populates="assessment")


class PatientResponse(Base):
    __tablename__ = "patient_responses"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"))
    question_id = Column(String, index=True)
    section = Column(String)
    score = Column(Integer)  # 1 to 4

    assessment = relationship("Assessment", back_populates="responses")
