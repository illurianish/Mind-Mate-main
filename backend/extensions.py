from flask_sqlalchemy import SQLAlchemy

# This is where we set up our database connection
# SQLAlchemy handles all the database stuff for us - creating tables, 
# running queries, managing connections, etc.
# We create it here and then initialize it in app.py with the actual Flask app
db = SQLAlchemy() 