import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
from fastapi import HTTPException, status
import os

load_dotenv()

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.environ.get('MYSQL_HOST'),
            user=os.environ.get('MYSQL_USER'),
            password=os.environ.get('MYSQL_PASSWORD'),
            database=os.environ.get('MYSQL_DATABASE')
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print("Error while connecting to MySQL:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection error"
        )