from math import log
import load
import pandas as pd
from reco_user_based_p2 import load_user_favorites, similarity_user_favorites

weights = {"tracks": 0.3, "artists": 0.2, "albums": 0.2, "genres": 0.2, "languages": 0.1}
total_weight = sum(weights.values())
jaccard = lambda A, B : len(A & B) / len(A | B)

def note(listens, is_track_fav, is_artist_fav, is_album_fav, is_genre_fav, listen_language) :
    listen_score = (log(listens) + 1)/10 if listens <= 8103 else 1
    return (
        listen_score + (
            is_track_fav * weights["tracks"] +
            is_artist_fav * weights["artists"] +
            is_album_fav * weights["albums"] +
            is_genre_fav * weights["genres"] +
            listen_language * weights["languages"]
            ) / total_weight
        ) / 2

def get_pred_for_user(user_id, track_id, sim=similarity_user_favorites) :
    conn = load.connection_db()
    cur = conn.cursor()
    cur.execute(f"SELECT user_id, nb_ecoute FROM user_ecoute WHERE track_id = {track_id};")
    data = cur.fetchall()
    columns = [desc[0] for desc in cur.description]
    users = pd.DataFrame(data, columns=columns)

    cur.execute(f"SELECT artist_id, album_id, language_id FROM track NATURAL JOIN realiser NATURAL JOIN track_chanter_en WHERE track_id = {track_id};")
    track_data = cur.fetchall()[0]
    cur.execute(f"SELECT genre_id FROM contient_genres WHERE track_id = {track_id};")
    data = cur.fetchall()
    track_info = {
        "artist": track_data[0],
        "album": track_data[1],
        "genres": [i[0] for i in data],
        "language": track_data[2]
        }
    user_fav = load_user_favorites(user_id, conn)
    if all(len(val) == 0 for val in user_fav.values()) :
        raise Exception("user has no favorites")
    deno = 0
    nume = 0
    for index, row in users.iterrows() :
        target_user_id = int(row['user_id'])
        if target_user_id == user_id : continue
        target_favs = load_user_favorites(target_user_id, conn)
        n = note(
            int(row['nb_ecoute']),
            track_id in target_favs['tracks'],
            track_info['artist'] in target_favs['artists'],
            track_info['album'] in target_favs['albums'],
            jaccard(set(track_info['genres']), set(target_favs['genres'])),
            track_info['language'] in target_favs['languages']
            )
        simmilarity = sim(user_fav, target_favs)
        deno += n * simmilarity
        nume += simmilarity
    return deno / nume

"""
if __name__ == "__main__" :
    get_pred_for_user(12, 155880)
"""