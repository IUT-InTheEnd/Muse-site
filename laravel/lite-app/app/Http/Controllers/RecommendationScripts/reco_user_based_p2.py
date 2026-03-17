import sys
import psycopg2
import psycopg2.extras
import basicsfunctions
import load
import pandas as pd
import numpy as np
from collections import Counter
import ast

# ----- Recommandation basée sur les utilisateurs pour les items (item-based) user based ? -----

def connection_db():
    return psycopg2.connect(
        dbname="InTheEnd_DB",
        user="InTheEnd_User",
        password="InTheEnd_Password",
        host="localhost",
        port="25000"
    )

def load_user_favorites(user_id, conn):
    """Load user's favorite music, artists, and albums"""
    cursor = conn.cursor()
    
    # Charger les favoris de l'utilisateur
    cursor.execute("""SELECT track_id FROM ajoute_favori WHERE user_id = %s""", (user_id,))
    track_fav = cursor.fetchall()
    
    cursor.execute("""SELECT artist_id FROM user_prefere_artiste WHERE user_id = %s""", (user_id,))
    artist_fav = cursor.fetchall()
    
    cursor.execute("""SELECT album_id FROM user_ajoute_album_favoris WHERE user_id = %s""", (user_id,))
    album_fav = cursor.fetchall()
    
    cursor.execute("""SELECT genre_id FROM ajoute_genre_favoris WHERE user_id = %s""", (user_id,))
    genre_fav = cursor.fetchall()

    cursor.execute("""SELECT language_id FROM user_parle WHERE user_id = %s""", (user_id,))
    language_fav = cursor.fetchall()

    cursor.execute("""SELECT up.explicit_ok FROM user_profile up JOIN "user" u ON u.profile_id = up.user_profile_id WHERE u.id = %s""", (user_id,))
    explicit_pref = cursor.fetchone()
    if explicit_pref is None or explicit_pref[0] >= 0:
        explicit_pref = True
    else:
        explicit_pref = False
    
    cursor.close()
    
    if not track_fav and not artist_fav and not album_fav:
        return {"tracks": [], "artists": [], "albums": []}
    
    return {
        "tracks": [f[0] for f in track_fav if f[0] is not None],
        "artists": list(set([f[0] for f in artist_fav if f[0] is not None])),
        "albums": list(set([f[0] for f in album_fav if f[0] is not None])),
        "genres": [f[0] for f in genre_fav if f[0] is not None],
        "languages": [f[0] for f in language_fav if f[0] is not None],
        "explicit": explicit_pref
    }

def get_track_features(track_id, tracks_df):
    """Extrait numériquement les caractéristiques d'une piste donnée"""
    if track_id not in tracks_df.index:
        return None
    
    track = tracks_df.loc[track_id]
    # Selection des colonnes numériques uniquement
    numeric_cols = track.select_dtypes(include=[np.number]).columns
    return track[numeric_cols].values

def similarity_user_favorites(user1_favs, user2_favs):
    """
    Calcule la similarité entre deux utilisateurs basée sur leurs favoris
    
    Avec des IDs (pas des vecteurs numériques), on utilise Jaccard
    Jaccard = |intersection| / |union|
    https://www.geeksforgeeks.org/python/jaccard-similarity/
    Oui j'ai le droit de le faire avec des ids en ensemble
    """

    # Convertir les listes en ensembles
    tracks1 = set(user1_favs.get("tracks", []))
    tracks2 = set(user2_favs.get("tracks", []))
    
    artists1 = set(user1_favs.get("artists", []))
    artists2 = set(user2_favs.get("artists", []))
    
    albums1 = set(user1_favs.get("albums", []))
    albums2 = set(user2_favs.get("albums", []))

    genres1 = set(user1_favs.get("genres", []))
    genres2 = set(user2_favs.get("genres", []))

    languages1 = set(user1_favs.get("languages", []))
    languages2 = set(user2_favs.get("languages", []))
    
    # Calculer les similarités de Jaccard pour chaque type
    track_sim = basicsfunctions.jaccard_similarity(tracks1, tracks2)
    artist_sim = basicsfunctions.jaccard_similarity(artists1, artists2)
    album_sim = basicsfunctions.jaccard_similarity(albums1, albums2)
    genre_sim = basicsfunctions.jaccard_similarity(genres1, genres2)
    language_sim = basicsfunctions.jaccard_similarity(languages1, languages2)
    
    # Poids pour chaque catégorie
    weights = {
        "tracks": 0.3,
        "artists": 0.2,
        "albums": 0.2,
        "genres": 0.2,
        "languages": 0.1
    }
    total_weight = sum(weights.values())
    
    # Moyenne pondérée
    similarity = (
        track_sim * weights["tracks"] +
        artist_sim * weights["artists"] +
        album_sim * weights["albums"] +
        genre_sim * weights["genres"] +
        language_sim * weights["languages"]
    ) / total_weight
    
    return similarity

def find_similar_users_by_favorites(target_user_id, all_users_df, conn, similarity_threshold=0.1):
    """
    Trouve les utilisateurs similaires basés sur les favoris
    Retourne une liste d'utilisateurs similaires avec leurs scores de similarité
    """
    target_favs = load_user_favorites(target_user_id, conn)
    
    if not any([target_favs["tracks"], target_favs["artists"], target_favs["albums"]]):
        print(f"L'user {target_user_id} n'a pas de favoris pour comparaison.", file=sys.stderr)
        return []
    
    similar_users = []
    
    for user_id in all_users_df["user_id"].unique():
        if user_id == target_user_id:
            continue
        
        user_id = int(user_id)
        user_favs = load_user_favorites(user_id, conn)
        sim = similarity_user_favorites(target_favs, user_favs)
        
        if sim >= similarity_threshold:
            similar_users.append((user_id, sim))
    
    # Trier par similarité décroissante
    similar_users.sort(key=lambda x: x[1], reverse=True)
    
    return similar_users

def recommend_based_on_similar_users(target_user_id, similar_users, tracks_df, get_title=False, top_k=10):
    """
    Agrège les recommandations des utilisateurs similaires
    Retourne les top-k pistes non encore notées par l'utilisateur cible
    """
    if not similar_users:
        return []
    
    conn = connection_db()
    
    # Charger les favoris de l'utilisateur cible
    target_favs = load_user_favorites(target_user_id, conn)
    target_fav_set = set(target_favs["tracks"])
    
    # Agréger les scores des pistes recommandées
    track_scores = Counter()
    
    for sim_user_id, similarity_score in similar_users:
        sim_user_favs = load_user_favorites(sim_user_id, conn)
        
        for track_id in sim_user_favs["tracks"]:
            if track_id not in target_fav_set:  # Ne pas recommander les pistes déjà favorites
                # N'ajoute pas la track si l'utilisateur ne veut pas de musique explicite
                cursor = conn.cursor()
                cursor.execute("""SELECT track_explicit FROM track WHERE track_id = %s""", (track_id,))
                result = cursor.fetchone()
                is_explicit = result[0] if result else False
                if not is_explicit or target_favs["explicit"]:
                    track_scores[track_id] += similarity_score
    
    # Obtenir les top-k recommandations
    recommendations = track_scores.most_common(top_k)
    
    cursor = conn.cursor()

    # Ajouter les titres des pistes si demandé
    if get_title:
        recommendations_with_titles = []
        for track_id, score in recommendations:
            cursor.execute("""SELECT a.track_title, t.artist_name FROM track a JOIN realiser r ON a.track_id = r.track_id JOIN artist t ON r.artist_id = t.artist_id WHERE a.track_id = %s""", (track_id,))
            result = cursor.fetchone()
            track_title = result[0] if result else "Unknown Title"
            artist_name = result[1] if result else "Unknown Artist"
            recommendations_with_titles.append((track_id, track_title, artist_name, score))
        return recommendations_with_titles
    
    conn.close()

    return recommendations


def get_recommendations_json(user_id, n):
    """Retourne une liste de track_ids en JSON"""
    conn = connection_db()
    
    all_users_df = load.load_users()
    tracks_df = load.load_tracks()
    
    similar_users = find_similar_users_by_favorites(user_id, all_users_df, conn, similarity_threshold=0.1)
    recommendations = recommend_based_on_similar_users(user_id, similar_users, tracks_df, get_title=False, top_k=n)
    
    conn.close()
    
    track_ids = [int(rec[0]) for rec in recommendations]
    return track_ids


if __name__ == "__main__":
    import sys
    import json
    
    if len(sys.argv) < 2:
        print(json.dumps([]))
        sys.exit(1)
    
    user_id = int(sys.argv[1])
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    
    track_ids = get_recommendations_json(user_id, n)
    print(json.dumps(track_ids))
