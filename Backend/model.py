from typing import List
from pydantic import BaseModel
from enum import Enum

class UserAuth(BaseModel):
    email: str
    password: str

class UserDetails(BaseModel):
    username: str
    usn: str
    role: str = "student"

class UserProfile(BaseModel):
    usn: str
    username: str
    role: str
    email: str

class TokenRequest(BaseModel):
    token: str

class Club(BaseModel):
    id: int
    name: str

class Location(str, Enum):
    VIRTUAL = "virtual"
    ONCAMPUS = "onCampus"
    OFFCAMPUS = "offCampus"

class Event(BaseModel):
    event_name: str
    organizer_name: str
    club_id: int
    is_internal: bool
    start_date_time: str
    end_date_time: str
    location_type: str  # 'virtual' | 'onCampus' | 'offCampus'
    location: str
    max_participants: int

class ClubRegistrationRequest(BaseModel):
    club_id: int  # Integer ID of the club
    club_name: str  # Name of the club

class EventRegistrationRequest(BaseModel):
    event_id: int
