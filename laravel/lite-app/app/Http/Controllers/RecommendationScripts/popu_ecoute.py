import pandas as pd
import psycopg2
import numpy as np
from math import floor

conn = psycopg2.connect(
        dbname="InTheEnd_DB",
        user="InTheEnd_User",
        password="InTheEnd_Password",
        host="localhost",
        port="25000"
    )

cur = conn.cursor()
cur.execute("SELECT * FROM ajoute_favori;")
data = cur.fetchall()
columns = [desc[0] for desc in cur.description]
df = pd.DataFrame(data, columns=columns)
# print(df.head())

insert_sql = "INSERT INTO user_ecoute (user_id, track_id, nb_ecoute) VALUES "

for index, row in df.iterrows() :
    nb_ecoute = floor(np.random.normal(5000, 2500))
    while nb_ecoute < 1 :
        nb_ecoute = floor(np.random.normal(5000, 2500))
    insert_sql += f"({row['user_id']}, {row['track_id']}, {nb_ecoute}), "

insert_sql = insert_sql[:-2] + ';'
cur.execute(insert_sql)
conn.commit()
