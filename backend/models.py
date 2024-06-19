from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from database import Base


class CableMeasurement(Base):
    __tablename__ = "ledningsmaaling_innmaaling"
    id = Column(Integer, primary_key=True)
    navn = Column(String)
