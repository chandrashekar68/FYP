from pydantic import BaseModel

class User(BaseModel):
    username: str
    email: str
    password: str

class TokenRequest(BaseModel):
    token: str

class Club(BaseModel):
    id: int
    name: str

class Event(BaseModel):
    id: int
    club_id: int
    name: str
    description: str
    date: str
