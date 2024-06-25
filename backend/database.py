from psycopg2 import connect
<<<<<<< HEAD
from psycopg2.extras import RealDictCursor
=======
from psycopg2.extras import DictCursor
>>>>>>> 2512494cae121105b9822626100c5baea744321f

# Enviroment varaibles
from dotenv import load_dotenv
import os

# Load the enviroment variables
load_dotenv()

# Database credentials
db_name = os.getenv("DB_NAME")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")

# Create connection to database
DATABASE_URL = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
try:
    connenction = connect(DATABASE_URL)
except:
    print("Failed to connect to the database")

# Cursor for executing queries as dictionaries
<<<<<<< HEAD
db = connenction.cursor(cursor_factory=RealDictCursor)
=======
db = connenction.cursor(cursor_factory=DictCursor)
>>>>>>> 2512494cae121105b9822626100c5baea744321f
# e.g: "print(row['id'], row['name'])"
