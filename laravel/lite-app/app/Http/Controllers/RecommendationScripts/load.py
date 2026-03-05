import psycopg2
import pandas as pd
import pycountry

def connection_db():
    return psycopg2.connect(
        dbname="InTheEnd_DB",
        user="InTheEnd_User",
        password="InTheEnd_Password",
        host="localhost",
        port="25000"
    )


def get_language_name(code):
    try:
        return pycountry.languages.get(alpha_2=code).name
    except:
        return "Unknown" 


def load_realiser():
    conn = connection_db()
    cur = conn.cursor()
    cur.execute("SELECT * from realiser JOIN artist ON realiser.artist_id = artist.artist_id JOIN track on track.track_id =  realiser.track_id ")
    data = cur.fetchall()
    columns = [desc[0] for desc in cur.description]  
    df = pd.DataFrame(data, columns=columns)
    df.columns = df.columns.map(lambda x: "_".join(x) if isinstance(x, tuple) else x)
    df = df.loc[:, ~df.columns.duplicated()].copy()
    cur.close()
    conn.close()
    return df


def load_users():
    conn = connection_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT u.id AS user_id, u.user_age, u.user_job, u.user_plays_music,
               u.user_gender, u.user_instruments, u.user_music_contexts,
               u.profile_id, up.*
        FROM "user" u
        JOIN user_profile up ON u.profile_id = up.user_profile_id
    """)
    data = cur.fetchall()
    columns = [desc[0] for desc in cur.description]
    df = pd.DataFrame(data, columns=columns)
    df = df.loc[:, ~df.columns.duplicated()].copy()

    cur.close()
    conn.close()
    return df


def load_tracks():
    conn = connection_db()
    cur = conn.cursor()
    
    cur.execute("SELECT * from track JOIN track_echonest on track.track_id = track_echonest.track_id")
    data = cur.fetchall()
    columns = [desc[0] for desc in cur.description]  
    df = pd.DataFrame(data, columns=columns)
    df = df.loc[:, ~df.columns.duplicated()]


    query = """
    SELECT track_id, genre_title FROM genre 
    JOIN contient_genres on contient_genres.genre_id = genre.genre_id
    """

    cur.execute(query)
    data_genres = cur.fetchall()

    df['track_language'] = df['track_language_code'].apply(get_language_name)

    cur.close()
    conn.close()

    df_genres = pd.DataFrame(data_genres, columns=['track_id', 'genre_title'])

    genres_par_track = df_genres.groupby('track_id')['genre_title'].apply(list)
    df['track_genres'] = df['track_id'].map(genres_par_track)

    return df


def load_genres():
    conn = connection_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM genre;")
    data = cur.fetchall()
    columns = [desc[0] for desc in cur.description]  
    df = pd.DataFrame(data, columns=columns)

    cur.close()
    conn.close()
    return df